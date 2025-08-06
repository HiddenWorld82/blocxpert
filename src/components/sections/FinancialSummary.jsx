// src/components/sections/FinancialSummary.jsx
import React from "react";

export default function FinancialSummary({ expenses, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...expenses, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dépenses annuelles</h2>
      <div>
        <label className="block text-sm font-medium">Taxes municipales + scolaires</label>
        <input
          type="number"
          value={expenses.taxes || 0}
          onChange={(e) => handleChange("taxes", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Assurances</label>
        <input
          type="number"
          value={expenses.insurance || 0}
          onChange={(e) => handleChange("insurance", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Entretien & gestion</label>
        <input
          type="number"
          value={expenses.maintenance || 0}
          onChange={(e) => handleChange("maintenance", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}