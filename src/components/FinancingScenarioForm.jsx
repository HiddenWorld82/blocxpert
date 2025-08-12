import React, { useEffect, useState } from "react";
import FinancingSection from "./sections/FinancingSection";
import AcquisitionCosts from "./sections/AcquisitionCosts";
import BasicInfo from "./sections/BasicInfo";
import RevenueSection from "./sections/RevenueSection";
import OperatingExpensesSection from "./sections/OperatingExpensesSection";
import { parseLocaleNumber } from "./FormattedNumberInput";
import { saveScenario, updateScenario } from "../services/dataService";

export default function FinancingScenarioForm({
  propertyId,
  onSaved,
  onBack,
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

  useEffect(() => {
    setScenario({
      title: "",
      financing: {},
      acquisitionCosts: {},
      ...initialScenario,
    });
  }, [initialScenario]);

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

  const handleSave = async () => {
    if (!propertyId) return;
    const data = {
      title: scenario.title,
      financing: scenario.financing,
      acquisitionCosts: scenario.acquisitionCosts,
      type,
    };
    if (initialScenario.id) {
      await updateScenario(propertyId, initialScenario.id, data);
    } else {
      await saveScenario(propertyId, data);
    }
    if (onSaved) onSaved();
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
            {property && (
              <>
                <BasicInfo
                  property={property}
                  onChange={() => {}}
                  advancedExpenses={advancedExpenses}
                  readOnly
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Nom du scénario
              </label>
              <input
                type="text"
                value={scenario.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Scénario"
              />
            </div>

            <FinancingSection
              financing={scenario.financing}
              onChange={handleFinancingChange}
            />

            <AcquisitionCosts
              costs={scenario.acquisitionCosts}
              onChange={handleCostsChange}
              advancedExpenses={advancedExpenses}
              analysis={{ acquisitionCosts: computeTotalCosts() }}
            />

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

