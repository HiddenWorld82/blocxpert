// src/components/sections/BasicInfo.jsx
import React from "react";

export default function BasicInfo({ property = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...property, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Informations de base</h2>
      <div>
        <label className="block text-sm font-medium">Adresse</label>
        <input
          type="text"
          value={property.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Prix d'achat</label>
        <input
            type="number"
            value={property.purchasePrice || 0}
            onChange={(e) => handleChange("purchasePrice", parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Nombre d'unités</label>
        <input
          type="number"
          value={property.units || 0}
          onChange={(e) => handleChange("units", parseInt(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}
