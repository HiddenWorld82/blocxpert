// src/components/sections/RevenueSection.jsx
import React from "react";
import FormattedNumberInput from "../FormattedNumberInput";

export default function RevenueSection({ revenue = {}, onChange, advancedExpenses }) {
  const handleChange = (field, value) => {
    onChange({ ...revenue, [field]: value });
  };

  if (!advancedExpenses) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Revenus annuels</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Loyers annuels</label>
          <FormattedNumberInput
            value={revenue.annualRent || ""}
            onChange={(val) => handleChange("annualRent", val)}
            className="w-full border rounded p-2"
            placeholder="0"
            type="currency"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Autres revenus</label>
          <FormattedNumberInput
            value={revenue.otherRevenue || ""}
            onChange={(val) => handleChange("otherRevenue", val)}
            className="w-full border rounded p-2"
            placeholder="0"
            type="currency"
          />
        </div>
      </div>
    );
  }

  const fields = [
    { field: "parkingRevenue", label: "Revenus de stationnement" },
    { field: "internetRevenue", label: "Revenus Internet" },
    { field: "storageRevenue", label: "Revenus de rangement" },
    { field: "otherRevenue", label: "Autres revenus" }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Revenus annuels</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Loyers annuels</label>
        <FormattedNumberInput
          value={revenue.annualRent || ""}
          onChange={(val) => handleChange("annualRent", val)}
          className="w-full border rounded p-2"
          placeholder="0"
          type="currency"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <FormattedNumberInput
              value={revenue[field] || ""}
              onChange={(val) => handleChange(field, val)}
              className="w-full border rounded p-2"
              placeholder="0"
              type="currency"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
