import React from "react";
import FormattedNumberInput from "../FormattedNumberInput";

export default function OperatingExpensesSection({ expenses = {}, onChange, advancedExpenses, lockedFields = {} }) {
  const handleChange = (field, value) => {
    onChange({ ...expenses, [field]: value });
  };

  const total = advancedExpenses
    ? [
        "municipalTaxes",
        "schoolTaxes",
        "heating",
        "electricity",
        "insurance",
        "maintenance",
        "concierge",
        "landscaping",
        "snowRemoval",
        "extermination",
        "fireInspection",
        "advertising",
        "legal",
        "accounting",
        "elevator",
        "cableInternet",
        "appliances",
        "garbage",
        "washerDryer",
        "hotWater",
        "otherExpenses",
      ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0)
    : [
        "municipalTaxes",
        "schoolTaxes",
        "electricityHeating",
        "otherExpenses",
      ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0);

  if (!advancedExpenses) {
    const simpleFields = [
      { field: "municipalTaxes", label: "Taxes municipales" },
      { field: "schoolTaxes", label: "Taxes scolaires" },
      { field: "electricityHeating", label: "Électricité/Chauffage" },
      { field: "otherExpenses", label: "Autres dépenses" },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Dépenses d'exploitation</h2>
        <div className="grid grid-cols-2 gap-4">
          {simpleFields.map(({ field, label }) => (
            <div key={field} className="col-span-1">
              <label className="block text-sm font-medium mb-1">{label}</label>
              <FormattedNumberInput
                value={expenses[field] || ""}
                onChange={(val) => handleChange(field, val)}
                className="w-full border rounded p-2"
                placeholder="0"
                type="currency"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total des dépenses</label>
          <FormattedNumberInput
            value={total || ""}
            onChange={() => {}}
            className="w-full border rounded p-2 bg-gray-100"
            placeholder="0"
            disabled
            type="currency"
          />
        </div>
      </div>
    );
  }

  const fields = [
    { field: "vacancyRate", label: "Taux de vacance (%)" },
    { field: "municipalTaxes", label: "Taxes municipales" },
    { field: "schoolTaxes", label: "Taxes scolaires" },
    { field: "heating", label: "Chauffage" },
    { field: "electricity", label: "Électricité" },
    { field: "insurance", label: "Assurances" },
    { field: "maintenance", label: "Entretien", locked: lockedFields?.maintenance },
    { field: "managementRate", label: "Gestion (%)" },
    { field: "concierge", label: "Conciergerie", locked: lockedFields?.concierge },
    { field: "landscaping", label: "Aménagement paysager" },
    { field: "snowRemoval", label: "Déneigement" },
    { field: "extermination", label: "Extermination" },
    { field: "fireInspection", label: "Inspection incendie" },
    { field: "advertising", label: "Publicité" },
    { field: "legal", label: "Frais légaux" },
    { field: "accounting", label: "Comptabilité" },
    { field: "elevator", label: "Ascenseur" },
    { field: "cableInternet", label: "Câble/Internet" },
    { field: "appliances", label: "Électroménagers" },
    { field: "garbage", label: "Ordures" },
    { field: "washerDryer", label: "Laveuse/Sécheuse" },
    { field: "hotWater", label: "Eau chaude" },
    { field: "otherExpenses", label: "Autres dépenses" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dépenses d'exploitation</h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label, locked }) => (
          <div key={field} className="col-span-1">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <FormattedNumberInput
              value={expenses[field] || ""}
              onChange={(val) => handleChange(field, val)}
              className="w-full border rounded p-2"
              placeholder="0"
              disabled={locked}
              type={field === "vacancyRate" || field === "managementRate" ? "percentage" : "currency"}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Total des dépenses</label>
        <FormattedNumberInput
          value={total || ""}
          onChange={() => {}}
          className="w-full border rounded p-2 bg-gray-100"
          placeholder="0"
          disabled
          type="currency"
        />
      </div>
    </div>
  );
}

