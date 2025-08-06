// src/components/sections/RevenueSection.jsx
import React from "react";

export default function RevenueSection({ revenue, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...revenue, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Revenus annuels</h2>
      <div>
        <label className="block text-sm font-medium">Loyers</label>
        <input
          type="number"
          value={revenue.rents || 0}
          onChange={(e) => handleChange("rents", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Revenus annexes (stationnement, etc.)</label>
        <input
          type="number"
          value={revenue.others || 0}
          onChange={(e) => handleChange("others", parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}