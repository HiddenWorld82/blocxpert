import React, { useEffect, useMemo, useState } from "react";
import FinancingSection from "./sections/FinancingSection";
import FinancingFeesSection from "./sections/FinancingFeesSection";
import FormattedNumberInput, { parseLocaleNumber } from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
import calculateRentability from "../utils/calculateRentability";
import { getScenarios, saveScenario, updateScenario } from "../services/dataService";

export default function FutureScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  type = "refinancing",
  property,
  advancedExpenses,
}) {
  const [scenario, setScenario] = useState({
    title: "",
    refinanceYears: "",
    marketValue: "",
    netIncomeIncreasePct: "",
    financing: {},
    financingFees: {},
    parentScenarioId: "",
    ...initialScenario,
  });

  const [lockedFields] = useState({
    debtCoverage: true,
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
      refinanceYears: "",
      marketValue: "",
      netIncomeIncreasePct: "",
      financing: {},
      financingFees: {},
      parentScenarioId: "",
      ...initialScenario,
    });
  }, [initialScenario.id]);

  const handleFinancingChange = (financing) => {
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleFeesChange = (fees) => {
    setScenario((prev) => ({ ...prev, financingFees: fees }));
  };

  const handleChange = (field, value) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const computeTotalFees = () => {
    return Object.values(scenario.financingFees).reduce(
      (sum, val) => sum + Number(parseLocaleNumber(val) || 0),
      0,
    );
  };

  useEffect(() => {
    if (!property?.purchasePrice || !scenario.refinanceYears) return;
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const years = Math.max(parseFloat(parseLocaleNumber(scenario.refinanceYears)) || 0, 0);
    const estimated = Math.round(
      purchasePrice * Math.pow(1 + 0.03, years)
    ).toString();
    setScenario((prev) => ({
      ...prev,
      marketValue: prev.marketValue || estimated,
    }));
  }, [scenario.refinanceYears, property?.purchasePrice]);

  const analysisProperty = useMemo(() => {
    if (!property) return null;
    const pct =
      (parseFloat(parseLocaleNumber(scenario.netIncomeIncreasePct)) || 0) / 100;
    const marketValue =
      parseFloat(parseLocaleNumber(scenario.marketValue)) ||
      parseFloat(property.purchasePrice) ||
      0;
    const years = parseFloat(parseLocaleNumber(scenario.refinanceYears)) || 0;
    const growthFactor = Math.pow(1 + pct, Math.max(years, 0));
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
    return {
      ...propertyWithoutCosts,
      ...scaled,
      purchasePrice: marketValue,
    };
    }, [
    property,
    scenario.marketValue,
    scenario.netIncomeIncreasePct,
    scenario.refinanceYears,
  ]);

  const combinedProperty = useMemo(() => {
    if (!analysisProperty) return null;
    return {
      ...analysisProperty,
      ...scenario.financing,
      ...scenario.financingFees,
      ignoreLTV: true,
    };
  }, [analysisProperty, scenario.financing, scenario.financingFees]);

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
    // Recalculate initial CMHC premium from scratch
    let premium = 0;
    if (["cmhc", "cmhc_aph"].includes(parentProperty?.financingType)) {
      const purchasePrice = parseFloat(parentProperty?.purchasePrice) || 0;
      const ltvRatio = purchasePrice > 0 ? (principal / purchasePrice) * 100 : 0;

      const standardRates = [
        { ltv: 65, rate: 0.026 },
        { ltv: 70, rate: 0.0285 },
        { ltv: 75, rate: 0.0335 },
        { ltv: 80, rate: 0.0435 },
        { ltv: 85, rate: 0.0535 },
      ];

      let premiumRate = 0;
      if (parentProperty.financingType === "cmhc_aph" && ltvRatio > 85) {
        premiumRate = ltvRatio <= 90 ? 0.059 : 0.0615;
      } else {
        const bracket = standardRates.find((b) => ltvRatio <= b.ltv);
        premiumRate = bracket?.rate || standardRates.at(-1).rate;
      }

      const amortizationYears = parseInt(parentProperty?.amortization) || 25;
      if (amortizationYears > 25) {
        premiumRate += ((amortizationYears - 25) / 5) * 0.0025;
      }

      if (parentProperty.financingType === "cmhc_aph") {
        const points = parseInt(parentProperty?.aphPoints) || 0;
        const rebate =
          points >= 100 ? 0.3 : points >= 70 ? 0.2 : points >= 50 ? 0.1 : 0;
        premiumRate *= 1 - rebate;
      }

      premium = principal * premiumRate;
    }

    const totalLoanAmount = principal + premium;
    const mortgageRate = (parseFloat(parentProperty?.mortgageRate) || 0) / 100;
    const monthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
    const amortizationYears = parseInt(parentProperty?.amortization) || 25;
    const totalPayments = amortizationYears * 12;
    const paymentsMade = Math.min(
      (parseFloat(parseLocaleNumber(scenario.refinanceYears)) || 0) * 12,
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
  }, [parentAnalysis, parentProperty, scenario.refinanceYears]);

  const analysis = useMemo(() => {
    if (!combinedProperty) return null;
    return calculateRentability(combinedProperty, advancedExpenses, {
      initialLoanAmount: existingLoanPrincipal,
    });
  }, [combinedProperty, advancedExpenses, existingLoanPrincipal]);

  const cmhcPremium = analysis?.cmhcPremium || 0;

  useEffect(() => {
    const financingType = scenario.financing.financingType;
    const units = parseInt(property?.numberOfUnits) || 0;
    if (["cmhc", "cmhc_aph"].includes(financingType) && units > 0) {
      const analysisAmount = (units * 150).toString();
      if (scenario.financingFees.cmhcAnalysis !== analysisAmount) {
        setScenario((prev) => ({
          ...prev,
          financingFees: { ...prev.financingFees, cmhcAnalysis: analysisAmount },
        }));
      }
    } else if (scenario.financingFees.cmhcAnalysis) {
      setScenario((prev) => ({
        ...prev,
        financingFees: { ...prev.financingFees, cmhcAnalysis: "" },
      }));
    }
  }, [
    scenario.financing.financingType,
    property?.numberOfUnits,
    scenario.financingFees.cmhcAnalysis,
  ]);

  useEffect(() => {
    const financingType = scenario.financing.financingType;
    if (["cmhc", "cmhc_aph"].includes(financingType)) {
      const taxAmount = analysis?.cmhcTax
        ? Math.round(analysis.cmhcTax).toString()
        : "";
      if (scenario.financingFees.cmhcTax !== taxAmount) {
        setScenario((prev) => ({
          ...prev,
          financingFees: { ...prev.financingFees, cmhcTax: taxAmount },
        }));
      }
    } else if (scenario.financingFees.cmhcTax) {
      setScenario((prev) => ({
        ...prev,
        financingFees: { ...prev.financingFees, cmhcTax: "" },
      }));
    }
  }, [analysis?.cmhcTax, scenario.financing.financingType, scenario.financingFees.cmhcTax]);

  const equityWithdrawal = useMemo(() => {
  if (!analysis) return 0;
  return (
    analysis.maxLoanAmount -
    existingLoanBalance -
    computeTotalFees()
  );
}, [analysis, existingLoanBalance, scenario.financingFees, cmhcPremium]);

  const isEquityNegative = equityWithdrawal < 0;


  useEffect(() => {
    if (!lockedFields.debtCoverage) return;
    const financingType = scenario.financing.financingType;
    const units = parseInt(property?.numberOfUnits) || 1;
    let newRatio = "1.15";
    if (financingType === "cmhc") {
      newRatio = units >= 7 ? "1.3" : "1.1";
    } else if (financingType === "cmhc_aph") {
      newRatio = "1.1";
    }
    if (scenario.financing.debtCoverageRatio !== newRatio) {
      setScenario((prev) => ({
        ...prev,
        financing: { ...prev.financing, debtCoverageRatio: newRatio },
      }));
    }
  }, [scenario.financing.financingType, property?.numberOfUnits]);

  const handleSave = async () => {
    const { id, ...dataWithoutId } = scenario;
    const data = { ...dataWithoutId, type };
    if (id) {
      await updateScenario(propertyId, id, data);
      onSaved && onSaved({ id, ...data });
    } else {
      const newId = await saveScenario(propertyId, data);
      onSaved && onSaved({ id: newId, ...data });
    }
  };

  const titleText = {
    refinancing: "Scénario de refinancement",
    incomeOptimization: "Scénario Optimisation des Revenus",
    renovation: "Scénario Optimisation par Rénovation",
  }[type] || "Scénario";

  const renderScenarioSections = () => (
    <>
      <FinancingSection
        financing={scenario.financing}
        onChange={handleFinancingChange}
      />
      <FinancingFeesSection
        fees={scenario.financingFees}
        onChange={handleFeesChange}
        analysis={{ financingFees: computeTotalFees() }}
        isCMHC={["cmhc", "cmhc_aph"].includes(scenario.financing.financingType)}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{titleText}</h2>
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
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
                <div>
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
                  <label className="block text-sm font-medium mb-1">Refinancement dans (années)</label>
                  <FormattedNumberInput
                    value={scenario.refinanceYears || ""}
                    onChange={(val) => handleChange("refinanceYears", val)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nouvelle valeur marchande</label>
                  <FormattedNumberInput
                    value={scenario.marketValue || ""}
                    onChange={(val) => handleChange("marketValue", val)}
                    className="w-full border rounded p-2"
                    type="currency"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">% augmentation revenus net</label>
                  <FormattedNumberInput
                    value={scenario.netIncomeIncreasePct || ""}
                    onChange={(val) => handleChange("netIncomeIncreasePct", val)}
                    className="w-full border rounded p-2"
                    type="percentage"
                  />
                </div>
              </div>
            </div>

            {renderScenarioSections()}

            {analysis && (
              <>
                <KeyIndicators analysis={analysis} variant="future" />
                <div className="grid md:grid-cols-2 gap-4">
                  <FinancialSummary
                    analysis={analysis}
                    advancedExpenses={advancedExpenses}
                  />
                  <FinancingSummary
                    analysis={analysis}
                    currentProperty={analysisProperty}
                    equityAmount={equityWithdrawal}
                  />
                </div>
              </>
            )}

            {isEquityNegative && (
              <div className="text-red-600 text-sm text-right">
                Ce scénario de refinancement n'est pas possible.
              </div>
            )}
            <div className="flex justify-end">
              {onSaved && (
                <button
                  onClick={handleSave}
                  disabled={isEquityNegative}
                  className={`px-6 py-2 text-white rounded-lg hover:bg-blue-700 ${
                    isEquityNegative
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600"
                  }`}
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

