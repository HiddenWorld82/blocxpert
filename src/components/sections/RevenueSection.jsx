// src/components/sections/RevenueSection.jsx
import React from "react";

export default function RevenueSection({ revenue = {}, onChange = () => {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Revenus</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Loyers annuels</label>
        <input
          type="number"
          name="annualRent"
          value={revenue.annualRent || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Revenus de stationnement</label>
        <input
          type="number"
          name="parkingRevenue"
          value={revenue.parkingRevenue || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Revenus d'internet</label>
        <input
          type="number"
          name="internetRevenue"
          value={revenue.internetRevenue || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Revenus d'entreposage</label>
        <input
          type="number"
          name="storageRevenue"
          value={revenue.storageRevenue || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Autres revenus</label>
        <input
          type="number"
          name="otherRevenue"
          value={revenue.otherRevenue || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </div>
  );
}