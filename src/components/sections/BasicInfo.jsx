import React from "react";

export default function BasicInfo({ property = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...property, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Informations de base</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <input
          type="text"
          value={property.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full border rounded p-2"
          placeholder="123 rue Example, Montréal"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prix d'achat</label>
          <input
            type="number"
            value={property.purchasePrice || ""}
            onChange={(e) => handleChange("purchasePrice", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nombre d'unités</label>
          <input
            type="number"
            value={property.numberOfUnits || ""}
            onChange={(e) => handleChange("numberOfUnits", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}