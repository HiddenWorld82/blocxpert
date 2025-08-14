import React, { useEffect, useState, useMemo } from "react";
import FinancingSection from "./sections/FinancingSection";
import AcquisitionCosts from "./sections/AcquisitionCosts";
import BasicInfo from "./sections/BasicInfo";
import RevenueSection from "./sections/RevenueSection";
import OperatingExpensesSection from "./sections/OperatingExpensesSection";
import { parseLocaleNumber } from "./FormattedNumberInput";
import calculateWelcomeTax from "../utils/calculateWelcomeTax";
import calculateRentability from "../utils/calculateRentability";
import { saveScenario, updateScenario } from "../services/dataService";

export default function FinancingScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  type = "initialFinancing",
  property,
  advancedExpenses,
}) {
  const [scenario, setScenario] = useState({
    title: "",
    financing: {},
    acquisitionCosts: {},
    ...initialScenario,
  });

  const [lockedFields] = useState({
    debtCoverage: true,
    welcomeTax: true,
  });

  useEffect(() => {
    setScenario({
      title: "",
      financing: {},
      acquisitionCosts: {},
      ...initialScenario,
    });
  }, [initialScenario.id]);

  const handleFinancingChange = (financing) => {
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleCostsChange = (costs) => {
    setScenario((prev) => ({ ...prev, acquisitionCosts: costs }));
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

  const analysis = useMemo(() => {
    if (!property) return null;
    const combinedProperty = { ...property, ...scenario.financing };
    return calculateRentability(combinedProperty, advancedExpenses);
  }, [property, scenario.financing, advancedExpenses]);

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
    const financingType = scenario.financing.financingType;
    if (["cmhc", "cmhc_aph"].includes(financingType)) {
      const taxAmount = analysis?.cmhcTax
        ? Math.round(analysis.cmhcTax).toString()
        : "";
      if (scenario.acquisitionCosts.cmhcTax !== taxAmount) {
        setScenario((prev) => ({
          ...prev,
          acquisitionCosts: { ...prev.acquisitionCosts, cmhcTax: taxAmount },
        }));
      }
    } else if (scenario.acquisitionCosts.cmhcTax) {
      setScenario((prev) => ({
        ...prev,
        acquisitionCosts: { ...prev.acquisitionCosts, cmhcTax: "" },
      }));
    }
  }, [analysis?.cmhcTax, scenario.financing.financingType, scenario.acquisitionCosts.cmhcTax]);

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
    type === "renovation" ? "Scénario de rénovation" : "Scénario de financement";

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
                Titre du scénario
              </h2>
              <input
                type="text"
                value={scenario.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Scénario"
              />
            </div>

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

