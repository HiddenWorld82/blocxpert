// src/components/sections/AcquisitionCosts.jsx
import React from "react";
import { Info } from "lucide-react";
import FormattedNumberInput from "../FormattedNumberInput";

export default function AcquisitionCosts({ costs = {}, onChange, lockedFields = {}, advancedExpenses }) {
  const handleChange = (field, value) => {
    onChange({ ...costs, [field]: value });
  };

  if (!advancedExpenses) {
    const fields = [
      {
        field: "expertises",
        label: "Expertises",
        info: "Inspection, études environnementales, évaluateur, autres tests",
      },
      { field: "notary", label: "Notaire", info: "Frais de notaire" },
      {
        field: "welcomeTax",
        label: "Taxe de bienvenue",
        info: "Droit de mutation municipale",
        locked: lockedFields?.welcomeTax,
      },
      {
        field: "renovations",
        label: "Rénovations",
        info: "Travaux initiaux ou améliorations",
      },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Frais d'acquisition</h2>
        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ field, label, info, locked }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">
                {label}
                <Info className="inline w-4 h-4 text-gray-400 ml-1" title={info} />
              </label>
              <FormattedNumberInput
                value={costs[field] || ""}
                onChange={(val) => handleChange(field, val)}
                className="w-full border rounded p-2"
                placeholder="0"
                disabled={locked}
                type="currency"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fields = [
    { field: "inspection", label: "Inspection" },
    { field: "environmental1", label: "Env. Phase I" },
    { field: "environmental2", label: "Env. Phase II" },
    { field: "environmental3", label: "Env. Phase III" },
    { field: "appraiser", label: "Évaluateur" },
    { field: "otherTests", label: "Autres tests" },
    { field: "notary", label: "Notaire" },
    { field: "welcomeTax", label: "Taxe de bienvenue", locked: lockedFields?.welcomeTax },
    { field: "renovations", label: "Rénovations" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Frais d'acquisition</h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label, locked }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <FormattedNumberInput
              value={costs[field] || ""}
              onChange={(val) => handleChange(field, val)}
              className="w-full border rounded p-2"
              placeholder="0"
              disabled={locked}
              type="currency"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

