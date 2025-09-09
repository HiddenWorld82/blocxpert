import React from "react";
import { Briefcase } from "lucide-react";
import FormattedNumberInput from "../FormattedNumberInput";
import { useLanguage } from "../../contexts/LanguageContext";

export default function FinancingFeesSection({
  fees = {},
  onChange,
  analysis = {},
  isCMHC = false,
  includeWorkCost = false,
}) {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    onChange({ ...fees, [field]: value });
  };

  const fields = [
    { field: "environmental1", label: t("financingFees.environmental1") },
    { field: "appraiser", label: t("financingFees.appraiser") },
    ...(isCMHC
      ? [
          { field: "cmhcAnalysis", label: t("financingFees.cmhcAnalysis"), locked: true },
          { field: "cmhcTax", label: t("financingFees.cmhcTax"), locked: true },
        ]
      : []),
    { field: "otherFees", label: t("financingFees.otherFees") },
    { field: "notary", label: t("financingFees.notary") },
    ...(includeWorkCost ? [{ field: "workCost", label: t("financingFees.workCost") }] : []),
  ];

  const sectionTitle = includeWorkCost
    ? t("financingFees.sectionTitleWithWork")
    : t("financingFees.sectionTitle");

  const totalLabel = includeWorkCost
    ? t("financingFees.totalWithWork")
    : t("financingFees.total");

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
        <Briefcase className="w-5 h-5 mr-2" />{sectionTitle}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label, locked }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <FormattedNumberInput
              value={fees[field] || ""}
              onChange={(val) => handleChange(field, val)}
              className="w-full border rounded p-2"
              placeholder="0"
              type="currency"
              disabled={locked}
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">{totalLabel}</label>
        <FormattedNumberInput
          value={analysis.financingFees?.toString() || ''}
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

