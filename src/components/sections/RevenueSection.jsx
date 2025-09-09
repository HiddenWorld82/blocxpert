// src/components/sections/RevenueSection.jsx
import React from "react";
import { DollarSign } from "lucide-react";
import FormattedNumberInput from "../FormattedNumberInput";
import { useLanguage } from "../../contexts/LanguageContext";

export default function RevenueSection({
  revenue = {},
  onChange,
  advancedExpenses,
  readOnly = false,
}) {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    onChange({ ...revenue, [field]: value });
  };

  if (!advancedExpenses) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-green-600 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          {t("revenue.title")}
        </h2>
        <div>
          <label className="block text-sm font-medium mb-1">{t("revenue.annualRent")}</label>
          <FormattedNumberInput
            value={revenue.annualRent || ""}
            onChange={(val) => handleChange("annualRent", val)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="0"
            type="currency"
            disabled={readOnly}
            readOnly={readOnly}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">{t("revenue.otherRevenue")}</label>
          <FormattedNumberInput
            value={revenue.otherRevenue || ""}
            onChange={(val) => handleChange("otherRevenue", val)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="0"
            type="currency"
            disabled={readOnly}
            readOnly={readOnly}
          />
        </div>
      </div>
    );
  }

  const fields = [
    { field: "parkingRevenue", label: t("revenue.parkingRevenue") },
    { field: "internetRevenue", label: t("revenue.internetRevenue") },
    { field: "storageRevenue", label: t("revenue.storageRevenue") },
    { field: "otherRevenue", label: t("revenue.otherRevenue") },
  ];

  return (
    <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-green-600 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          {t("revenue.title")}
        </h2>
      <div>
        <label className="block text-sm font-medium mb-1">{t("revenue.annualRent")}</label>
        <FormattedNumberInput
          value={revenue.annualRent || ""}
          onChange={(val) => handleChange("annualRent", val)}
          className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
          placeholder="0"
          type="currency"
          disabled={readOnly}
          readOnly={readOnly}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {fields.map(({ field, label }) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <FormattedNumberInput
              value={revenue[field] || ""}
              onChange={(val) => handleChange(field, val)}
              className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
              placeholder="0"
              type="currency"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
