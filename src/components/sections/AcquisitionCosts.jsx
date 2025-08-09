// src/components/sections/AcquisitionCosts.jsx
import React from "react";
import { Info, Home, DollarSign, TrendingUp, Briefcase, Building, Calculator } from 'lucide-react';
import FormattedNumberInput from "../FormattedNumberInput";

export default function AcquisitionCosts({ costs = {}, onChange, lockedFields = {}, advancedExpenses, analysis = {} }) {
  const handleChange = (field, value) => {
    onChange({ ...costs, [field]: value });
  };

  const isCMHC = ["cmhc", "cmhc_aph"].includes(costs.financingType);

  if (!advancedExpenses) {
    const fields = [
      {
        field: "expertises",
        label: "Expertises",
        info: "Inspection, études environnementales, évaluateur, autres tests",
      },
      { field: "notary", label: "Notaire", info: "Frais de notaire" },
      ...(isCMHC
        ? [
            { field: "cmhcAnalysis", label: "Frais d'analyse SCHL", info: "150$ par logement", locked: true },
            { field: "cmhcTax", label: "Taxe sur la prime SCHL", info: "9% de la prime SCHL", locked: true },
          ]
        : []),
      {
        field: "welcomeTax",
        label: "Taxe de bienvenue",
        info: "Droit de mutation municipale",
        locked: lockedFields?.welcomeTax,
      },
      {
        field: "otherFees",
        label: "Autres frais",
        info: "Autres frais d'acquisition tel que travaux à l'acquisition, frais analyse SCHL, taxe sur prime SCHL,  etc.",
      },
    ];

    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center"> <Briefcase className="w-5 h-5 mr-2" />Frais d'acquisition</h2>
        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ field, label, info, locked }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">
                {label}
                {info && <Info className="inline w-4 h-4 text-gray-400 ml-1" title={info} />}
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
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Total des Frais d'Acquisition</label>
          <FormattedNumberInput
            value={analysis.acquisitionCosts?.toString() || ''}
            onChange={() => {}}
            className="w-full border rounded p-2 bg-gray-50"
            placeholder="0"
            disabled
            type="currency"
          />
        </div>
      </div>
    );
  }

  const fields = [
    { field: "inspection", label: "Inspection" },
    { field: "environmental1", label: "Env. Phase I" },
    { field: "environmental2", label: "Env. Phase II" },
    { field: "environmental3", label: "Env. Phase III" },
    { field: "appraiser", label: "Évaluateur agréé" },
    ...(isCMHC
      ? [
          { field: "cmhcAnalysis", label: "Frais d'analyse SCHL", locked: true },
          { field: "cmhcTax", label: "Taxe sur la prime SCHL", locked: true },
        ]
      : []),
    { field: "otherFees", label: "Autres frais" },
    { field: "notary", label: "Notaire" },
    { field: "welcomeTax", label: "Taxe de bienvenue", locked: lockedFields?.welcomeTax },
    { field: "renovations", label: "Rénovations" },
  ];

  return (
    <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center"> <Briefcase className="w-5 h-5 mr-2" />Frais d'acquisition</h2>
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
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Total des Frais d'Acquisition</label>
        <FormattedNumberInput
          value={analysis.acquisitionCosts?.toString() || ''}
          onChange={() => {}}
          className="w-full border rounded p-2 bg-gray-50"
          placeholder="0"
          disabled
          type="currency"
        />
      </div>
    </div>
  );
}


