// src/components/sections/FinancingSection.jsx
import React from "react";

export default function FinancingSection({ financing, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...financing, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Financement</h2>
      <div>
        <label className="block text-sm font-medium">Montant du prêt</label>
        <input
          type="number"
          value={financing.loanAmount || 0}
          onChange={(e) => handleChange("loanAmount", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Taux d'intérêt (%)</label>
        <input
          type="number"
          value={financing.interestRate || 0}
          onChange={(e) => handleChange("interestRate", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Durée (années)</label>
        <input
          type="number"
          value={financing.term || 0}
          onChange={(e) => handleChange("term", parseInt(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}