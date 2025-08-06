// src/components/sections/FinancingSection.jsx
import React from "react";

export default function FinancingSection({ financing = {}, onChange = () => {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Financement</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de financement</label>
        <select
          name="financingType"
          value={financing.financingType || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="conventional">Conventionnel</option>
          <option value="aph">APH Sélect</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Montant du prêt</label>
        <input
          type="number"
          name="loanAmount"
          value={financing.loanAmount || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Taux hypothécaire (%)</label>
        <input
          type="number"
          name="mortgageRate"
          value={financing.mortgageRate || ''}
          onChange={handleChange}
          step="0.01"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amortissement (années)</label>
        <input
          type="number"
          name="amortization"
          value={financing.amortization || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Terme (années)</label>
        <input
          type="number"
          name="term"
          value={financing.term || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </div>
  );
}
