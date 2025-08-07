// src/components/sections/RevenueSection.jsx
import React from "react";

export default function RevenueSection({ revenue = {}, onChange, advancedExpenses }) {
  const handleChange = (field, value) => {
    onChange({ ...revenue, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Revenus annuels</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Loyers annuels</label>
        <input
          type="number"
          value={revenue.annualRent || ""}
          onChange={(e) => handleChange("annualRent", e.target.value)}
          className="w-full border rounded p-2"
          placeholder="0"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Revenus de stationnement</label>
          <input
            type="number"
            value={revenue.parkingRevenue || ""}
            onChange={(e) => handleChange("parkingRevenue", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Autres revenus</label>
          <input
            type="number"
            value={revenue.otherRevenue || ""}
            onChange={(e) => handleChange("otherRevenue", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
        {advancedExpenses && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Revenus Internet</label>
              <input
                type="number"
                value={revenue.internetRevenue || ""}
                onChange={(e) => handleChange("internetRevenue", e.target.value)}
                className="w-full border rounded p-2"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Revenus de rangement</label>
              <input
                type="number"
                value={revenue.storageRevenue || ""}
                onChange={(e) => handleChange("storageRevenue", e.target.value)}
                className="w-full border rounded p-2"
                placeholder="0"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}