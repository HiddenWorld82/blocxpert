// src/components/sections/AcquisitionCosts.jsx
import React from "react";
import { Info, Briefcase } from "lucide-react";
import FormattedNumberInput from "../FormattedNumberInput";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AcquisitionCosts({
  costs = {},
  onChange,
  lockedFields = {},
  advancedExpenses,
  analysis = {},
  financingType,
}) {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    onChange({ ...costs, [field]: value });
  };

  const isCMHC = ["cmhc", "cmhc_aph"].includes(financingType);

  if (!advancedExpenses) {
    const fields = [
      {
        field: "expertises",
        label: t("acquisitionCosts.expertises"),
        info: t("acquisitionCosts.expertisesInfo"),
      },
      { field: "notary", label: t("acquisitionCosts.notary"), info: t("acquisitionCosts.notaryInfo") },
      ...(isCMHC
        ? [
            { field: "cmhcAnalysis", label: t("acquisitionCosts.cmhcAnalysis"), info: t("acquisitionCosts.cmhcAnalysisInfo"), locked: true },
            { field: "cmhcTax", label: t("acquisitionCosts.cmhcTax"), info: t("acquisitionCosts.cmhcTaxInfo"), locked: true },
          ]
        : []),
      {
        field: "welcomeTax",
        label: t("acquisitionCosts.welcomeTax"),
        info: t("acquisitionCosts.welcomeTaxInfo"),
        locked: lockedFields?.welcomeTax,
      },
      {
        field: "otherFees",
        label: t("acquisitionCosts.otherFees"),
        info: t("acquisitionCosts.otherFeesInfo"),
      },
    ];

    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          {t("acquisitionCosts.title")}
        </h2>
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
          <label className="block text-sm font-medium mb-1">{t("acquisitionCosts.total")}</label>
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
    { field: "inspection", label: t("acquisitionCosts.inspection") },
    { field: "environmental1", label: t("acquisitionCosts.environmental1") },
    { field: "environmental2", label: t("acquisitionCosts.environmental2") },
    { field: "environmental3", label: t("acquisitionCosts.environmental3") },
    { field: "appraiser", label: t("acquisitionCosts.appraiser") },
    ...(isCMHC
      ? [
          { field: "cmhcAnalysis", label: t("acquisitionCosts.cmhcAnalysis"), locked: true },
          { field: "cmhcTax", label: t("acquisitionCosts.cmhcTax"), locked: true },
        ]
      : []),
    { field: "otherFees", label: t("acquisitionCosts.otherFees") },
    { field: "notary", label: t("acquisitionCosts.notary") },
    { field: "welcomeTax", label: t("acquisitionCosts.welcomeTax"), locked: lockedFields?.welcomeTax },
    { field: "renovations", label: t("acquisitionCosts.renovations") },
  ];

  return (
    <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          {t("acquisitionCosts.title")}
        </h2>
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
        <label className="block text-sm font-medium mb-1">{t("acquisitionCosts.total")}</label>
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


