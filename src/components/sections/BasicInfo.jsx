import React from "react";
import FormattedNumberInput from "../FormattedNumberInput";

export default function BasicInfo({ property = {}, onChange, advancedExpenses }) {
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
        {advancedExpenses && (
          <div>
            <label className="block text-sm font-medium mb-1">Prix demandé</label>
            <FormattedNumberInput
              value={property.askingPrice || ""}
              onChange={(val) => handleChange("askingPrice", val)}
              className="w-full border rounded p-2"
              placeholder="0"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Prix d'achat</label>
          <FormattedNumberInput
            value={property.purchasePrice || ""}
            onChange={(val) => handleChange("purchasePrice", val)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
        {advancedExpenses && (
          <div>
            <label className="block text-sm font-medium mb-1">Évaluation municipale</label>
            <FormattedNumberInput
              value={property.municipalEvaluation || ""}
              onChange={(val) => handleChange("municipalEvaluation", val)}
              className="w-full border rounded p-2"
              placeholder="0"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre d'unités</label>
          <FormattedNumberInput
            value={property.numberOfUnits || ""}
            onChange={(val) => handleChange("numberOfUnits", val)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
