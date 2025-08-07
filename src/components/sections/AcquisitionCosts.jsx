// src/components/sections/AcquisitionCosts.jsx
import React from "react";

export default function AcquisitionCosts({ costs = {}, onChange, lockedFields = {} }) {
  const handleChange = (field, value) => {
    onChange({ ...costs, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Frais d'acquisition</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Inspection</label>
          <input
            type="number"
            value={costs.inspection || ""}
            onChange={(e) => handleChange("inspection", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notaire</label>
          <input
            type="number"
            value={costs.notary || ""}
            onChange={(e) => handleChange("notary", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Taxe de bienvenue</label>
        <input
          type="number"
          value={costs.welcomeTax || ""}
          onChange={(e) => handleChange("welcomeTax", e.target.value)}
          className="w-full border rounded p-2"
          placeholder="0"
          disabled={lockedFields?.welcomeTax}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Dépenses d'exploitation annuelles</label>
        <input
          type="number"
          value={costs.operatingExpenses || ""}
          onChange={(e) => handleChange("operatingExpenses", e.target.value)}
          className="w-full border rounded p-2"
          placeholder="0"
        />
      </div>
    </div>
  );
}