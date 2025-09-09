import React, { useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import FormattedNumberInput, { formatCurrency } from "../FormattedNumberInput";
import schlExpenses from "../../defaults/schlExpenses";
import { useLanguage } from "../../contexts/LanguageContext";

export default function OperatingExpensesSection({
  expenses = {},
  onChange,
  advancedExpenses,
  readOnly = false,
}) {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    onChange({ ...expenses, [field]: value });
  };

  const numberOfUnits = parseInt(expenses.numberOfUnits) || 0;
  const province = expenses.province;
  const structureType = expenses.structureType || 'woodFrame';

  const provinceConfig = province ? schlExpenses[province] : null;
  let schlConfig;
  if (provinceConfig) {
    if (structureType === 'woodFrame') {
      schlConfig = provinceConfig.woodFrame[numberOfUnits <= 11 ? 'small' : 'large'];
    } else {
      schlConfig = provinceConfig.concrete.any;
    }
  }

  const totalRevenue = [
    "annualRent",
    "parkingRevenue",
    "internetRevenue",
    "storageRevenue",
    "otherRevenue",
  ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0);

  const vacancyAmount = totalRevenue * ((parseFloat(expenses.vacancyRate) || 0) / 100);
  const effectiveRevenue = totalRevenue - vacancyAmount;
  const managementFee = effectiveRevenue * ((parseFloat(expenses.managementRate) || 0) / 100);
  const maintenancePerUnit = parseFloat(expenses.maintenance) || 0;
  const conciergePerUnit = parseFloat(expenses.concierge) || 0;
  const maintenanceTotal = parseFloat(expenses.maintenance) * numberOfUnits;
  const conciergeTotal = parseFloat(expenses.concierge) * numberOfUnits;
  const otherCostRate = advancedExpenses ? (schlConfig?.otherCostRate || 0) : 0;
  const otherExpensesDefault = advancedExpenses ? effectiveRevenue * otherCostRate / 100 : 0;
  const otherExpenses =
    expenses.otherExpenses !== undefined && expenses.otherExpenses !== ""
      ? parseFloat(expenses.otherExpenses)
      : otherExpensesDefault;

  const numHeatPumps = parseInt(expenses.numHeatPumps) || 0;
  const numElevators = parseInt(expenses.numElevators) || 0;
  const numFridges = parseInt(expenses.numFridges) || 0;
  const numStoves = parseInt(expenses.numStoves) || 0;
  const numDishwashers = parseInt(expenses.numDishwashers) || 0;
  const numWashers = parseInt(expenses.numWashers) || 0;
  const numDryers = parseInt(expenses.numDryers) || 0;

  const rrRates = schlConfig?.replacementReserve || {};
  const rrBreakdown = {
    numHeatPumps: { rate: rrRates.heatPump || 0, count: numHeatPumps, multiplier: 1 },
    numFridges: { rate: rrRates.appliance || 0, count: numFridges, multiplier: 1 },
    numStoves: { rate: rrRates.appliance || 0, count: numStoves, multiplier: 1 },
    numDishwashers: { rate: rrRates.appliance || 0, count: numDishwashers, multiplier: 1 },
    numWashers: { rate: rrRates.appliance || 0, count: numWashers, multiplier: 1 },
    numDryers: { rate: rrRates.appliance || 0, count: numDryers, multiplier: 1 },
    numElevators: { rate: rrRates.elevator || 0, count: numElevators, multiplier: 12 },
  };

  Object.values(rrBreakdown).forEach(item => {
    item.value = item.rate * item.count * item.multiplier;
  });

  const replacementReserve = Object.values(rrBreakdown).reduce(
    (sum, item) => sum + item.value,
    0
  );

  const replacementReserveCalculation = () => {
    const parts = Object.values(rrBreakdown)
      .filter(item => item.value)
      .map(item => formatCurrency(item.value));
    return parts.length
      ? `${parts.join(" + ")} = ${formatCurrency(replacementReserve)}`
      : "";
  };

  const prevProvinceRef = useRef(province);

  useEffect(() => {
    if (!schlConfig) return;
    const updates = {};
    const prevProvince = prevProvinceRef.current;

    if (province !== prevProvince) {
      updates.maintenance = schlConfig.maintenance.toString();
      updates.managementRate = schlConfig.managementRate.toString();
      updates.concierge = schlConfig.salaries.toString();
    } else {
      if (!expenses.maintenance) updates.maintenance = schlConfig.maintenance.toString();
      if (!expenses.managementRate) updates.managementRate = schlConfig.managementRate.toString();
      if (!expenses.concierge) updates.concierge = schlConfig.salaries.toString();
    }
    if (Object.keys(updates).length > 0) {
      onChange(prev => ({ ...prev, ...updates }));
    }
    prevProvinceRef.current = province;
  }, [schlConfig, province, expenses.maintenance, expenses.managementRate, expenses.concierge, onChange]);

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
        "garbage",
        "hotWater",
        "otherExpenses",
      ].reduce(
        (sum, key) => {
          if (otherCostRate > 0 && [
            "landscaping",
            "snowRemoval",
            "extermination",
            "fireInspection",
            "advertising",
            "legal",
            "accounting",
          ].includes(key)) {
            return sum;
          }
          return sum + (key === "otherExpenses" ? otherExpenses : (parseFloat(expenses[key]) || 0));
        },
        0,
      ) + managementFee + vacancyAmount + maintenanceTotal + conciergeTotal + replacementReserve
    : [
        "municipalTaxes",
        "schoolTaxes",
        "insurance",
        "electricityHeating",
        "management",
    ].reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0) + managementFee + vacancyAmount + maintenanceTotal + conciergeTotal + replacementReserve + otherExpenses

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
      { field: "vacancyRate", label: t("operatingExpenses.vacancyRate") },
      { field: "insurance", label: t("operatingExpenses.insurance") },
      { field: "municipalTaxes", label: t("operatingExpenses.municipalTaxes") },
      { field: "schoolTaxes", label: t("operatingExpenses.schoolTaxes") },
      { field: "electricityHeating", label: t("operatingExpenses.electricityHeating") },
      { field: "maintenance", label: t("operatingExpenses.maintenancePerUnit") },
      { field: "concierge", label: t("operatingExpenses.conciergePerUnit") },
      { field: "managementRate", label: t("operatingExpenses.managementRate") },
      { field: "otherExpenses", label: t("operatingExpenses.otherExpenses") },
    ];

    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {t("operatingExpenses.title")}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {simpleFields.map(({ field, label }) => (
            <div key={field} className="col-span-1">
              <label className="block text-sm font-medium mb-1">{label}</label>
              <FormattedNumberInput
                value={field === "otherExpenses"
                  ? (expenses.otherExpenses !== undefined && expenses.otherExpenses !== ""
                      ? expenses.otherExpenses
                      : otherExpensesDefault)
                  : (expenses[field] || "")}
                onChange={(val) => handleChange(field, val)}
                className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
                placeholder="0"
                type={field === "vacancyRate" || field=== "managementRate" ? "percentage" : "currency"}
                disabled={readOnly}
                readOnly={readOnly}
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
                  ? `${expenses.managementRate}% de ${formatCurrency(effectiveRevenue)} = ${formatCurrency(managementFee)}`
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
            {field === "otherExpenses" && otherCostRate > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {`${otherCostRate}% de ${formatCurrency(effectiveRevenue)} = ${formatCurrency(otherExpensesDefault)}`}
              </p>
            )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">{t("operatingExpenses.totalExpenses")}</label>
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
    { field: "vacancyRate", label: t("operatingExpenses.vacancyRate") },
    { field: "insurance", label: t("operatingExpenses.insurance") },
    { field: "municipalTaxes", label: t("operatingExpenses.municipalTaxes") },
    { field: "schoolTaxes", label: t("operatingExpenses.schoolTaxes") },
    { field: "heating", label: t("operatingExpenses.heating") },
    { field: "electricity", label: t("operatingExpenses.electricity") },
    { field: "maintenance", label: t("operatingExpenses.maintenancePerUnit") },
    { field: "managementRate", label: t("operatingExpenses.managementRate") },
    { field: "concierge", label: t("operatingExpenses.conciergePerUnit") },
    { field: "landscaping", label: t("operatingExpenses.landscaping") },
    { field: "snowRemoval", label: t("operatingExpenses.snowRemoval") },
    { field: "extermination", label: t("operatingExpenses.extermination") },
    { field: "fireInspection", label: t("operatingExpenses.fireInspection") },
    { field: "advertising", label: t("operatingExpenses.advertising") },
    { field: "legal", label: t("operatingExpenses.legal") },
    { field: "accounting", label: t("operatingExpenses.accounting") },
    { field: "elevator", label: t("operatingExpenses.elevator") },
    { field: "cableInternet", label: t("operatingExpenses.cableInternet") },
    { field: "garbage", label: t("operatingExpenses.garbage") },
    { field: "hotWater", label: t("operatingExpenses.hotWater") },
    { field: "numHeatPumps", label: t("operatingExpenses.numHeatPumps") },
    { field: "numFridges", label: t("operatingExpenses.numFridges") },
    { field: "numStoves", label: t("operatingExpenses.numStoves") },
    { field: "numDishwashers", label: t("operatingExpenses.numDishwashers") },
    { field: "numWashers", label: t("operatingExpenses.numWashers") },
    { field: "numDryers", label: t("operatingExpenses.numDryers") },
    { field: "numElevators", label: t("operatingExpenses.numElevators") },
    { field: "otherExpenses", label: t("operatingExpenses.otherExpenses") },
  ];

  const integerFields = [
    "numHeatPumps",
    "numFridges",
    "numStoves",
    "numDishwashers",
    "numWashers",
    "numDryers",
    "numElevators",
  ];

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        {t("operatingExpenses.title")}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label }) => {
          const isDisabled = otherCostRate > 0 && [
            "landscaping",
            "snowRemoval",
            "extermination",
            "fireInspection",
            "advertising",
            "legal",
            "accounting",
          ].includes(field);

          return (
            <div key={field} className="col-span-1">
              <label className="block text-sm font-medium mb-1">{label}</label>
              <FormattedNumberInput
                value={field === "otherExpenses"
                  ? (expenses.otherExpenses !== undefined && expenses.otherExpenses !== ""
                      ? expenses.otherExpenses
                      : otherExpensesDefault)
                  : (expenses[field] || "")}
                onChange={(val) => handleChange(field, val)}
                className={`w-full border rounded p-2 ${(readOnly || isDisabled) ? 'bg-gray-100' : ''}`}
                placeholder="0"
                type={
                  field === "vacancyRate" || field === "managementRate"
                    ? "percentage"
                    : integerFields.includes(field)
                    ? "number"
                    : "currency"
                }
                disabled={readOnly || isDisabled}
                readOnly={readOnly || isDisabled}
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
                    ? `${expenses.managementRate}% de ${formatCurrency(effectiveRevenue)} = ${formatCurrency(managementFee)}`
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
              {field === "otherExpenses" && otherCostRate > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {`${otherCostRate}% de ${formatCurrency(effectiveRevenue)} = ${formatCurrency(otherExpensesDefault)}`}
                </p>
              )}
              {isDisabled && (
                <p className="text-xs text-gray-500 mt-1">{t("operatingExpenses.includedInOther")}</p>
              )}
              {rrBreakdown[field]?.value > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {`${formatCurrency(rrBreakdown[field].rate)} × ${
                    rrBreakdown[field].multiplier > 1
                      ? rrBreakdown[field].multiplier + ' × '
                      : ''
                  }${rrBreakdown[field].count} = ${formatCurrency(
                    rrBreakdown[field].value
                  )}`}
                </p>
              )}
            </div>
          );
        })}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">{t("operatingExpenses.replacementReserve")}</label>
          <FormattedNumberInput
            value={replacementReserve || ""}
            onChange={() => {}}
            className="w-full border rounded p-2 bg-gray-100"
            placeholder="0"
            disabled
            type="currency"
          />
          {replacementReserveCalculation() && (
            <p className="text-xs text-gray-500 mt-1">
              {replacementReserveCalculation()}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">{t("operatingExpenses.totalExpenses")}</label>
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

