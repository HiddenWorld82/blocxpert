import React, { useEffect } from "react";
import { TrendingUp } from 'lucide-react';
import FormattedNumberInput, { formatCurrency } from "../FormattedNumberInput";

export default function OperatingExpensesSection({ expenses = {}, onChange, advancedExpenses }) {
  const handleChange = (field, value) => {
    onChange({ ...expenses, [field]: value });
  };

  const numberOfUnits = parseInt(expenses.numberOfUnits) || 0;

  const totalRevenue = [
    "annualRent",
    "parkingRevenue",
    "internetRevenue",
    "storageRevenue",
    "otherRevenue",
  ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0);

  const vacancyAmount = totalRevenue * ((parseFloat(expenses.vacancyRate) || 0) / 100);
  const managementFee = totalRevenue * ((parseFloat(expenses.managementRate) || 0) / 100);
  const maintenancePerUnit = parseFloat(expenses.maintenance) || 0;
  const conciergePerUnit = parseFloat(expenses.concierge) || 0;
  const maintenanceTotal = parseFloat(expenses.maintenance) * numberOfUnits;
  const conciergeTotal = parseFloat(expenses.concierge) * numberOfUnits;

  /**useEffect(() => {
    if (!advancedExpenses) return;
    if (lockedFields.maintenance) {
      const expected = numberOfUnits > 0 ? maintenanceTotal.toString() : "";
      if (expenses.maintenance !== expected) {
        onChange(prev => ({ ...prev, maintenance: expected }));
      }
    }
    if (lockedFields.concierge) {
      const expected = numberOfUnits > 0 ? conciergeTotal.toString() : "";
      if (expenses.concierge !== expected) {
        onChange(prev => ({ ...prev, concierge: expected }));
      }
    }
  }, [advancedExpenses, numberOfUnits, maintenanceTotal, conciergeTotal, lockedFields, expenses.maintenance, expenses.concierge, onChange]);**/

  const total = advancedExpenses
    ? [
        "municipalTaxes",
        "schoolTaxes",
        "heating",
        "electricity",
        "insurance",
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
      ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0) + managementFee + vacancyAmount + maintenanceTotal + conciergeTotal
    : [
        "municipalTaxes",
        "schoolTaxes",
        "insurance",
        "electricityHeating",
        "management",
        "otherExpenses",
    ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0) + managementFee + vacancyAmount + maintenanceTotal + conciergeTotal

  useEffect(() => {
    if (!advancedExpenses) {
      const current = parseFloat(expenses.operatingExpenses) || 0;
      if (current !== total) {
        onChange(prev => ({ ...prev, operatingExpenses: total.toString() }));
      }
    }
  }, [total, advancedExpenses, onChange, expenses.operatingExpenses]);

  if (!advancedExpenses) {
    const simpleFields = [
      { field: "vacancyRate", label: "Vacances / mauvaises créances (%)" },
      { field: "insurance", label: "Assurance" },
      { field: "municipalTaxes", label: "Taxes municipales" },
      { field: "schoolTaxes", label: "Taxes scolaires" },
      { field: "electricityHeating", label: "Électricité/Chauffage" },
      { field: "maintenance", label: "Entretien (par logement)" },
      { field: "concierge", label: "Conciergerie (par logement)" },
      { field: "managementRate", label: "Gestion / Administration (%)" },
      { field: "otherExpenses", label: "Autres dépenses" },
    ];

    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Dépenses d'exploitation</h2>
        <div className="grid grid-cols-2 gap-4">
          {simpleFields.map(({ field, label }) => (
            <div key={field} className="col-span-1">
              <label className="block text-sm font-medium mb-1">{label}</label>
              <FormattedNumberInput
                value={expenses[field] || ""}
                onChange={(val) => handleChange(field, val)}
                className="w-full border rounded p-2"
                placeholder="0"
                type={field === "vacancyRate" || field=== "managementRate" ? "percentage" : "currency"}
              />
              {field === "vacancyRate" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.vacancyRate
                  ? `${expenses.vacancyRate}% de ${formatCurrency(totalRevenue)} = ${formatCurrency(vacancyAmount)}`
                  : ''}
              </p>
            )}
            {field === "managementRate" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.managementRate
                  ? `${expenses.managementRate}% de ${formatCurrency(totalRevenue)} = ${formatCurrency(managementFee)}`
                  : ''}
              </p>
            )}
            {field === "maintenance" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.maintenance
                  ? `${formatCurrency(maintenancePerUnit)} × ${numberOfUnits} = ${formatCurrency(maintenanceTotal)}`
                  : ''}
              </p>
            )}
            {field === "concierge" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.concierge
                  ? `${formatCurrency(conciergePerUnit)} × ${numberOfUnits} = ${formatCurrency(conciergeTotal)}`
                  : ''}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
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
    { field: "insurance", label: "Assurances" },
    { field: "municipalTaxes", label: "Taxes municipales" },
    { field: "schoolTaxes", label: "Taxes scolaires" },
    { field: "heating", label: "Chauffage" },
    { field: "electricity", label: "Électricité" },
    { field: "maintenance", label: "Entretien (par logement)" },
    { field: "managementRate", label: "Gestion / Administration (%)" },
    { field: "concierge", label: "Conciergerie (par logement)" },
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
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center"> <TrendingUp className="w-5 h-5 mr-2" />Dépenses d'exploitation</h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label }) => (
          <div key={field} className="col-span-1">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <FormattedNumberInput
              value={expenses[field] || ""}
              onChange={(val) => handleChange(field, val)}
              className="w-full border rounded p-2"
              placeholder="0"
              type={field === "vacancyRate" || field === "managementRate" ? "percentage" : "currency"}
            />
            {field === "vacancyRate" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.vacancyRate
                  ? `${expenses.vacancyRate}% de ${formatCurrency(totalRevenue)} = ${formatCurrency(vacancyAmount)}`
                  : ''}
              </p>
            )}
            {field === "managementRate" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.managementRate
                  ? `${expenses.managementRate}% de ${formatCurrency(totalRevenue)} = ${formatCurrency(managementFee)}`
                  : ''}
              </p>
            )}
            {field === "maintenance" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.maintenance
                  ? `${formatCurrency(maintenancePerUnit)} × ${numberOfUnits} = ${formatCurrency(maintenanceTotal)}`
                  : ''}
              </p>
            )}
            {field === "concierge" && (
              <p className="text-xs text-gray-500 mt-1">
                {expenses.concierge
                  ? `${formatCurrency(conciergePerUnit)} × ${numberOfUnits} = ${formatCurrency(conciergeTotal)}`
                  : ''}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
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

