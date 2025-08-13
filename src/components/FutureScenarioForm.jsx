import React, { useEffect, useMemo, useState } from "react";
import FinancingSection from "./sections/FinancingSection";
import AcquisitionCosts from "./sections/AcquisitionCosts";
import BasicInfo from "./sections/BasicInfo";
import RevenueSection from "./sections/RevenueSection";
import OperatingExpensesSection from "./sections/OperatingExpensesSection";
import FormattedNumberInput, { parseLocaleNumber } from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
import calculateWelcomeTax from "../utils/calculateWelcomeTax";
import calculateRentability from "../utils/calculateRentability";
import { saveScenario, updateScenario } from "../services/dataService";

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
    refinanceDate: "",
    marketValue: "",
    netIncomeIncreasePct: "",
    financing: {},
    acquisitionCosts: {},
    revenue: {},
    expenses: {},
    ...initialScenario,
  });

  const [lockedFields] = useState({
    debtCoverage: true,
    welcomeTax: true,
  });

  useEffect(() => {
    setScenario({
      title: "",
      refinanceDate: "",
      marketValue: "",
      netIncomeIncreasePct: "",
      financing: {},
      acquisitionCosts: {},
      revenue: {},
      expenses: {},
      ...initialScenario,
    });
  }, [initialScenario.id]);

  const handleFinancingChange = (financing) => {
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleCostsChange = (costs) => {
    setScenario((prev) => ({ ...prev, acquisitionCosts: costs }));
  };

  const handleRevenueChange = (revenue) => {
    setScenario((prev) => ({ ...prev, revenue }));
  };

  const handleExpensesChange = (expenses) => {
    setScenario((prev) => ({ ...prev, expenses }));
  };

  const handleChange = (field, value) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const computeTotalCosts = () => {
    return Object.values(scenario.acquisitionCosts).reduce(
      (sum, val) => sum + Number(parseLocaleNumber(val) || 0),
      0
    );
  };

  useEffect(() => {
    if (!property?.purchasePrice || !scenario.refinanceDate) return;
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const refDate = new Date(scenario.refinanceDate);
    const currentYear = new Date().getFullYear();
    const years = Math.max(refDate.getFullYear() - currentYear, 0);
    const estimated = Math.round(
      purchasePrice * Math.pow(1 + 0.03, years)
    ).toString();
    setScenario((prev) => ({
      ...prev,
      marketValue: prev.marketValue || estimated,
    }));
  }, [scenario.refinanceDate, property?.purchasePrice]);

  const analysisProperty = useMemo(() => {
    if (!property) return null;
    const pct =
      (parseFloat(parseLocaleNumber(scenario.netIncomeIncreasePct)) || 0) /
      100;
    const marketValue =
      parseFloat(parseLocaleNumber(scenario.marketValue)) ||
      parseFloat(property.purchasePrice) ||
      0;
    return {
      ...property,
      purchasePrice: marketValue,
      annualRent: (parseFloat(property.annualRent) || 0) * (1 + pct),
    };
  }, [property, scenario.marketValue, scenario.netIncomeIncreasePct]);

  const combinedProperty = useMemo(() => {
    if (!analysisProperty) return null;
    return {
      ...analysisProperty,
      ...scenario.financing,
      ...scenario.acquisitionCosts,
    };
  }, [analysisProperty, scenario.financing, scenario.acquisitionCosts]);

  const analysis = useMemo(() => {
    if (!combinedProperty) return null;
    return calculateRentability(combinedProperty, advancedExpenses);
  }, [combinedProperty, advancedExpenses]);

  useEffect(() => {
    if (!lockedFields.welcomeTax) return;
    const purchasePrice = parseFloat(property?.purchasePrice) || 0;
    if (purchasePrice > 0) {
      const welcomeTax = Math.round(calculateWelcomeTax(purchasePrice)).toString();
      if (scenario.acquisitionCosts.welcomeTax !== welcomeTax) {
        setScenario((prev) => ({
          ...prev,
          acquisitionCosts: { ...prev.acquisitionCosts, welcomeTax },
        }));
      }
    }
  }, [
    property?.purchasePrice,
    lockedFields.welcomeTax,
    scenario.acquisitionCosts.welcomeTax,
  ]);

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
  }, [
    scenario.financing.financingType,
    property?.numberOfUnits,
    lockedFields.debtCoverage,
    scenario.financing.debtCoverageRatio,
  ]);

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
    incomeOptimization: "Scénario optimisation revenus",
    renovation: "Scénario optimisation rénovation",
  }[type] || "Scénario";

  const renderScenarioSections = () => {
    switch (type) {
      case "incomeOptimization":
        return (
          <>
            <RevenueSection
              revenue={scenario.revenue}
              onChange={handleRevenueChange}
              advancedExpenses={advancedExpenses}
            />
            <OperatingExpensesSection
              expenses={scenario.expenses}
              onChange={handleExpensesChange}
              advancedExpenses={advancedExpenses}
            />
          </>
        );
      default:
        return (
          <>
            <FinancingSection
              financing={scenario.financing}
              onChange={handleFinancingChange}
              lockedFields={lockedFields}
            />
            <AcquisitionCosts
              costs={scenario.acquisitionCosts}
              onChange={handleCostsChange}
              advancedExpenses={advancedExpenses}
              analysis={{ acquisitionCosts: computeTotalCosts() }}
              lockedFields={lockedFields}
            />
          </>
        );
    }
  };

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
            {property && (
              <>
                <BasicInfo
                  property={property}
                  onChange={() => {}}
                  advancedExpenses={advancedExpenses}
                  readOnly
                  disablePlaceAutocomplete
                />
                <RevenueSection
                  revenue={property}
                  onChange={() => {}}
                  advancedExpenses={advancedExpenses}
                  readOnly
                />
                <OperatingExpensesSection
                  expenses={property}
                  onChange={() => {}}
                  advancedExpenses={advancedExpenses}
                  readOnly
                />
              </>
            )}

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
                  <label className="block text-sm font-medium mb-1">Date de refinancement</label>
                  <input
                    type="date"
                    value={scenario.refinanceDate || ""}
                    onChange={(e) => handleChange("refinanceDate", e.target.value)}
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
                <KeyIndicators analysis={analysis} />
                <FinancialSummary
                  analysis={analysis}
                  advancedExpenses={advancedExpenses}
                />
                <FinancingSummary
                  analysis={analysis}
                  currentProperty={analysisProperty}
                />
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

