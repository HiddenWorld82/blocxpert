// src/components/sections/AcquisitionCosts.jsx
import React from "react";

export default function AcquisitionCosts({ costs = {}, onChange = () => {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Frais d'acquisition</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Inspection</label>
        <input
          type="number"
          name="inspection"
          value={costs.inspection || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Évaluateur</label>
        <input
          type="number"
          name="appraiser"
          value={costs.appraiser || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Taxe de bienvenue</label>
        <input
          type="number"
          name="welcomeTax"
          value={costs.welcomeTax || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </div>
  );
}
