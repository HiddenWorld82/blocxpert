import React, { useState } from "react";
import FinancingSection from "./sections/FinancingSection";
import AcquisitionCosts from "./sections/AcquisitionCosts";
import { parseLocaleNumber } from "./FormattedNumberInput";
import { saveFinancingScenario } from "../services/dataService";

export default function FinancingScenarioForm({ propertyId, onSaved }) {
  const [scenario, setScenario] = useState({
    title: "",
    financing: {},
    acquisitionCosts: {},
  });

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
    };
    await saveFinancingScenario(propertyId, data);
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-6">
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
        advancedExpenses={false}
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
  );
}

