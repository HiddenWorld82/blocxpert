// src/components/sections/FinancialSummary.jsx
import React from "react";

export default function FinancialSummary({ expenses = {}, onChange = () => {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dépenses principales</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Taxes municipales</label>
        <input
          type="number"
          name="municipalTaxes"
          value={expenses.municipalTaxes || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Taxes scolaires</label>
        <input
          type="number"
          name="schoolTaxes"
          value={expenses.schoolTaxes || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Assurance</label>
        <input
          type="number"
          name="insurance"
          value={expenses.insurance || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Entretien</label>
        <input
          type="number"
          name="maintenance"
          value={expenses.maintenance || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </div>
  );
}
