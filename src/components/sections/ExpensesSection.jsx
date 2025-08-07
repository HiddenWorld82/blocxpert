import React from "react";

export default function ExpensesSection({ expenses = {}, onChange, advancedExpenses, lockedFields = {} }) {
  const handleChange = (field, value) => {
    onChange({ ...expenses, [field]: value });
  };

  if (!advancedExpenses) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Dépenses d'exploitation</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Dépenses d'exploitation annuelles</label>
          <input
            type="number"
            value={expenses.operatingExpenses || ""}
            onChange={(e) => handleChange("operatingExpenses", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
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
    { field: "otherExpenses", label: "Autres dépenses" }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dépenses d'exploitation</h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label, locked }) => (
          <div key={field} className="col-span-1">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="number"
              value={expenses[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full border rounded p-2"
              placeholder="0"
              disabled={locked}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
