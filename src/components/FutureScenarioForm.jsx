import React, { useEffect, useMemo, useState } from "react";
import FinancingSection from "./sections/FinancingSection";
import FinancingFeesSection from "./sections/FinancingFeesSection";
import FormattedNumberInput, {
  parseLocaleNumber,
} from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
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
    financingFees: {},
    ...initialScenario,
  });

  const [lockedFields] = useState({
    debtCoverage: true,
  });

  useEffect(() => {
    setScenario({
      title: "",
      refinanceDate: "",
      marketValue: "",
      netIncomeIncreasePct: "",
      financing: {},
      financingFees: {},
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
    if (!property?.purchasePrice || !scenario.refinanceDate) return;
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const refDate = new Date(scenario.refinanceDate);
    const currentYear = new Date().getFullYear();
    const years = Math.max(refDate.getFullYear() - currentYear, 0);
    const estimated = Math.round(
      purchasePrice * Math.pow(1 + 0.03, years),
    ).toString();
    setScenario((prev) => ({
      ...prev,
      marketValue: prev.marketValue || estimated,
    }));
  }, [scenario.refinanceDate, property?.purchasePrice]);

  const analysisProperty = useMemo(() => {
    if (!property) return null;
    const pct =
      (parseFloat(parseLocaleNumber(scenario.netIncomeIncreasePct)) || 0) / 100;
    const marketValue =
      parseFloat(parseLocaleNumber(scenario.marketValue)) ||
      parseFloat(property.purchasePrice) ||
      0;
    const years = scenario.refinanceDate
      ? new Date(scenario.refinanceDate).getFullYear() -
        new Date().getFullYear()
      : 0;
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
    return {
      ...property,
      ...scaled,
      purchasePrice: marketValue,
    };
  }, [
    property,
    scenario.marketValue,
    scenario.netIncomeIncreasePct,
    scenario.refinanceDate,
  ]);

  const combinedProperty = useMemo(() => {
    if (!analysisProperty) return null;
    return {
      ...analysisProperty,
      ...scenario.financing,
      ...scenario.financingFees,
    };
  }, [analysisProperty, scenario.financing, scenario.financingFees]);

  const analysis = useMemo(() => {
    if (!combinedProperty) return null;
    return calculateRentability(combinedProperty, advancedExpenses);
  }, [combinedProperty, advancedExpenses]);

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

  const titleText =
    {
      refinancing: "Scénario de refinancement",
      incomeOptimization: "Scénario optimisation revenus",
      renovation: "Scénario optimisation rénovation",
    }[type] || "Scénario";

  const renderScenarioSections = () => (
    <>
      <FinancingSection
        financing={scenario.financing}
        onChange={handleFinancingChange}
        lockedFields={lockedFields}
      />
      <FinancingFeesSection
        fees={scenario.financingFees}
        onChange={handleFeesChange}
        analysis={{ financingFees: computeTotalFees() }}
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
                  <label className="block text-sm font-medium mb-1">
                    Titre
                  </label>
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
                    Date de refinancement
                  </label>
                  <input
                    type="date"
                    value={scenario.refinanceDate || ""}
                    onChange={(e) =>
                      handleChange("refinanceDate", e.target.value)
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nouvelle valeur marchande
                  </label>
                  <FormattedNumberInput
                    value={scenario.marketValue || ""}
                    onChange={(val) => handleChange("marketValue", val)}
                    className="w-full border rounded p-2"
                    type="currency"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    % augmentation revenus net
                  </label>
                  <FormattedNumberInput
                    value={scenario.netIncomeIncreasePct || ""}
                    onChange={(val) =>
                      handleChange("netIncomeIncreasePct", val)
                    }
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
