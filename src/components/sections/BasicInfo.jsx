// src/components/sections/BasicInfo.jsx
import React from "react";

export default function BasicInfo({ property = {}, onChange = () => {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Informations de base</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Adresse</label>
        <input
          type="text"
          name="address"
          value={property.address || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Prix demandé</label>
        <input
          type="number"
          name="askingPrice"
          value={property.askingPrice || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Prix d'achat</label>
        <input
          type="number"
          name="purchasePrice"
          value={property.purchasePrice || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Évaluation municipale</label>
        <input
          type="number"
          name="municipalEvaluation"
          value={property.municipalEvaluation || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre d'unités</label>
        <input
          type="number"
          name="numberOfUnits"
          value={property.numberOfUnits || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </div>
  );
}