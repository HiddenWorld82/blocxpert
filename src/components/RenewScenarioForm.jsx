import React, { useEffect, useMemo, useState } from "react";
import FormattedNumberInput, { parseLocaleNumber } from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
import calculateRentability from "../utils/calculateRentability";
import { getScenarios, saveScenario, updateScenario } from "../services/dataService";

export default function RenewScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  property,
  advancedExpenses,
}) {
  const [scenario, setScenario] = useState({
    title: "",
    marketValue: "",
    netIncomeIncreasePct: "",
    financing: {},
    parentScenarioId: "",
    ...initialScenario,
  });

  const [parentScenario, setParentScenario] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    const unsub = getScenarios(propertyId, (scenarios) => {
      const baseId = scenario.parentScenarioId;
      const parent = baseId
        ? scenarios.find((s) => s.id === baseId)
        : scenarios.find((s) => s.type === "initialFinancing");
      setParentScenario(parent);
    });
    return () => unsub && unsub();
  }, [propertyId, scenario.parentScenarioId]);

  useEffect(() => {
    setScenario({
      title: "",
      marketValue: "",
      netIncomeIncreasePct: "",
      financing: {},
      parentScenarioId: "",
      ...initialScenario,
    });
  }, [initialScenario.id]);

  const handleFinancingChange = (financing) => {
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleChange = (field, value) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };
  useEffect(() => {
    if (!property?.purchasePrice) return;
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const term = parseFloat(parentScenario?.financing?.term) || 0;
    const estimated = Math.round(
      purchasePrice * Math.pow(1 + 0.03, term)
    ).toString();
    setScenario((prev) => ({ ...prev, marketValue: estimated }));
  }, [property?.purchasePrice, parentScenario?.financing?.term]);

  const parentProperty = useMemo(() => {
    if (!property) return null;
    if (!parentScenario) return property;
    return {
      ...property,
      ...parentScenario.financing,
      ...parentScenario.acquisitionCosts,
    };
  }, [property, parentScenario]);

  const parentAnalysis = useMemo(() => {
    if (!parentProperty) return null;
    return calculateRentability(parentProperty, advancedExpenses);
  }, [parentProperty, advancedExpenses]);

  const { existingLoanBalance, existingLoanPrincipal } = useMemo(() => {
    if (!parentAnalysis)
      return { existingLoanBalance: 0, existingLoanPrincipal: 0 };
    const principal = parentAnalysis.maxLoanAmount || 0;
    const totalLoanAmount = principal;
    const mortgageRate = (parseFloat(parentProperty?.mortgageRate) || 0) / 100;
    const monthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
    const amortizationYears = parseInt(parentProperty?.amortization) || 25;
    const totalPayments = amortizationYears * 12;
    const paymentsMade = Math.min(
      (parseInt(parentProperty?.term) || 0) * 12,
      totalPayments,
    );
    if (monthlyRate <= 0)
      return { existingLoanBalance: totalLoanAmount, existingLoanPrincipal: principal };
    const balance =
      totalLoanAmount *
      (Math.pow(1 + monthlyRate, totalPayments) -
        Math.pow(1 + monthlyRate, paymentsMade)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    const factor = balance / totalLoanAmount;
    return {
      existingLoanBalance: balance,
      existingLoanPrincipal: principal * factor,
    };
  }, [parentAnalysis, parentProperty]);

  const remainingAmortization = useMemo(() => {
    const amort = parseInt(parentProperty?.amortization) || 25;
    const term = parseInt(parentProperty?.term) || 0;
    return Math.max(amort - term, 0);
  }, [parentProperty]);

  const analysisProperty = useMemo(() => {
    if (!property) return null;
    const pct =
      (parseFloat(parseLocaleNumber(scenario.netIncomeIncreasePct)) || 0) / 100;
    const termYears = parseInt(parentScenario?.financing?.term) || 0;
    const marketValue =
      parseFloat(parseLocaleNumber(scenario.marketValue)) ||
      parseFloat(property.purchasePrice) ||
      0;
    const growthFactor = Math.pow(1 + pct, Math.max(termYears, 0));
    const revenueFields = [
      "annualRent",
      "parkingRevenue",
      "internetRevenue",
      "storageRevenue",
      "otherRevenue",
    ];
    const expenseFields = [
      "municipalTaxes",
      "schoolTaxes",
      "insurance",
      "electricityHeating",
      "maintenance",
      "concierge",
      "operatingExpenses",
      "otherExpenses",
      "heating",
      "electricity",
      "landscaping",
      "snowRemoval",
      "extermination",
      "fireInspection",
      "advertising",
      "legal",
      "accounting",
      "elevator",
      "cableInternet",
      "appliances",
      "garbage",
      "washerDryer",
      "hotWater",
    ];
    const scaled = {};
    [...revenueFields, ...expenseFields].forEach((field) => {
      const value = parseFloat(property[field]);
      if (!isNaN(value)) {
        scaled[field] = value * growthFactor;
      }
    });
    const acquisitionCostFields = [
      "inspection",
      "environmental1",
      "environmental2",
      "environmental3",
      "otherFees",
      "appraiser",
      "notary",
      "renovations",
      "cmhcAnalysis",
      "cmhcTax",
      "welcomeTax",
      "expertises",
    ];
    const propertyWithoutCosts = { ...property };
    acquisitionCostFields.forEach((field) => {
      delete propertyWithoutCosts[field];
    });
    return { ...propertyWithoutCosts, ...scaled, purchasePrice: marketValue };
  }, [
    property,
    scenario.marketValue,
    scenario.netIncomeIncreasePct,
    parentScenario?.financing?.term,
  ]);

  const combinedFinancing = useMemo(() => {
    const parentFin = parentScenario?.financing || {};
    const mortgageRate =
      scenario.financing.mortgageRate || parentFin.mortgageRate || "";
    return {
      ...parentFin,
      ...scenario.financing,
      mortgageRate,
      qualificationRate: mortgageRate,
      amortization: remainingAmortization.toString(),
    };
  }, [parentScenario?.financing, scenario.financing, remainingAmortization]);

  const combinedProperty = useMemo(() => {
    if (!analysisProperty) return null;
    return {
      ...analysisProperty,
      ...combinedFinancing,
    };
  }, [analysisProperty, combinedFinancing]);

  const baseAnalysis = useMemo(() => {
    if (!combinedProperty) return null;
    return calculateRentability(combinedProperty, advancedExpenses, {
      initialLoanAmount: existingLoanPrincipal,
    });
  }, [combinedProperty, advancedExpenses, existingLoanPrincipal]);

  const analysis = useMemo(() => {
    if (!baseAnalysis) return null;
    const mortgageRate =
      (parseFloat(combinedFinancing.mortgageRate) || 0) / 100;
    const monthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
    const totalPayments =
      (parseInt(combinedFinancing.amortization) || 0) * 12;
    const totalLoanAmount = existingLoanBalance;
    const monthlyPayment =
      totalLoanAmount > 0 && monthlyRate > 0
        ? (totalLoanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1)
        : 0;
    const annualDebtService = monthlyPayment * 12;
    const cashFlow = baseAnalysis.effectiveNetIncome - annualDebtService;
    return {
      ...baseAnalysis,
      maxLoanAmount: existingLoanPrincipal,
      totalLoanAmount,
      cmhcPremium: 0,
      monthlyPayment,
      annualDebtService,
      cashFlow,
    };
  }, [
    baseAnalysis,
    combinedFinancing.mortgageRate,
    combinedFinancing.amortization,
    existingLoanBalance,
    existingLoanPrincipal,
  ]);

  const handleSave = async () => {
    const { id, ...dataWithoutId } = scenario;
    const data = {
      ...dataWithoutId,
      type: "renewal",
      financing: combinedFinancing,
    };
    if (id) {
      await updateScenario(propertyId, id, data);
      onSaved && onSaved({ id, ...data });
    } else {
      const newId = await saveScenario(propertyId, data);
      onSaved && onSaved({ id: newId, ...data });
    }
  };

  const titleText = "Scénario de renouvellement";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{titleText}</h2>
            {onBack && (
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                ← Retour
              </button>
            )}
          </div>

          <div className="space-y-8">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Paramètres du scénario
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    type="text"
                    value={scenario.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Scénario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    % augmentation revenus net
                  </label>
                  <FormattedNumberInput
                    value={scenario.netIncomeIncreasePct || ""}
                    onChange={(val) => handleChange("netIncomeIncreasePct", val)}
                    className="w-full border rounded p-2"
                    type="percentage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valeur marchande à l'échéance
                  </label>
                  <FormattedNumberInput
                    value={scenario.marketValue || ""}
                    onChange={() => {}}
                    className="w-full border rounded p-2 bg-gray-100"
                    type="currency"
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-purple-600">
                Financement
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nouveau taux d'intérêt (%)
                  </label>
                  <FormattedNumberInput
                    value={scenario.financing.mortgageRate || ""}
                    onChange={(val) =>
                      handleFinancingChange({ ...scenario.financing, mortgageRate: val })
                    }
                    className="w-full border rounded p-2"
                    type="percentage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Terme (années)</label>
                  <select
                    value={scenario.financing.term || ""}
                    onChange={(e) =>
                      handleFinancingChange({ ...scenario.financing, term: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  >
                    <option value="1">1 an</option>
                    <option value="2">2 ans</option>
                    <option value="3">3 ans</option>
                    <option value="5">5 ans</option>
                    <option value="10">10 ans</option>
                  </select>
                </div>
              </div>
            </div>

            {analysis && (
              <>
                <KeyIndicators analysis={analysis} variant="future" />
                <div className="grid md:grid-cols-2 gap-4">
                  <FinancialSummary analysis={analysis} advancedExpenses={advancedExpenses} />
                  <FinancingSummary
                    analysis={analysis}
                    currentProperty={analysisProperty}
                    financing={combinedFinancing}
                    scenarioType="renewal"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end">
              {onSaved && (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
