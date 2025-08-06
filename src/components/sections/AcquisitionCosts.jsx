// src/components/sections/AcquisitionCosts.jsx
import React from "react";

export default function AcquisitionCosts({ costs, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...costs, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Frais d'acquisition</h2>
      <div>
        <label className="block text-sm font-medium">Inspection</label>
        <input
          type="number"
          value={costs.inspection || 0}
          onChange={(e) => handleChange("inspection", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Notaire</label>
        <input
          type="number"
          value={costs.notary || 0}
          onChange={(e) => handleChange("notary", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Taxe de bienvenue</label>
        <input
          type="number"
          value={costs.welcomeTax || 0}
          onChange={(e) => handleChange("welcomeTax", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}