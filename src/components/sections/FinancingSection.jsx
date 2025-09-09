// src/components/sections/FinancingSection.jsx
import React from "react";
import { Calculator } from "lucide-react";
import FormattedNumberInput from "../FormattedNumberInput";
import { useLanguage } from "../../contexts/LanguageContext";

export default function FinancingSection({
  financing = {},
  onChange,
  lockedFields = {},
}) {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    onChange({ ...financing, [field]: value }, field);
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-purple-600 flex items-center">
        <Calculator className="w-5 h-5 mr-2" />
        {t("financing.title")}
      </h2>
      <div>
        <label className="block text-sm font-medium mb-1">{t("financing.type")}</label>
        <select
          value={financing.financingType || "conventional"}
          onChange={(e) => handleChange("financingType", e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="conventional">{t("financing.type.conventional")}</option>
          <option value="cmhc">{t("financing.type.cmhc")}</option>
          <option value="cmhc_aph">{t("financing.type.cmhc_aph")}</option>
          <option value="private">{t("financing.type.private")}</option>
        </select>
      </div>
      
      {financing.financingType === "cmhc_aph" && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">{t("financing.aphPoints")}</label>
          <FormattedNumberInput
            value={financing.aphPoints || ""}
            onChange={(val) => handleChange("aphPoints", val)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("financing.mortgageRate")}</label>
          <FormattedNumberInput
            value={financing.mortgageRate || ""}
            onChange={(val) => handleChange("mortgageRate", val)}
            className="w-full border rounded p-2"
            placeholder="5.5"
            type="percentage"
          />
        </div>
        {financing.financingType === "private" ? (
          <div>
            <label className="block text-sm font-medium mb-1">{t("financing.ltvRatio")}</label>
            <FormattedNumberInput
              value={financing.ltvRatio || ""}
              onChange={(val) => handleChange("ltvRatio", val)}
              className="w-full border rounded p-2"
              placeholder="60"
              type="percentage"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">{t("financing.amortization")}</label>
            <FormattedNumberInput
              value={financing.amortization || ""}
              onChange={(val) => handleChange("amortization", val)}
              className="w-full border rounded p-2"
              placeholder="25"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">{t("financing.term")}</label>
          <select
            value={financing.term || ""}
            onChange={(e) => handleChange("term", e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="1">1 an</option>
            <option value="2">2 ans</option>
            <option value="3">3 ans</option>
            <option value="5">5 ans</option>
            <option value="10">10 ans</option>
          </select>
        </div>
      </div>

      {financing.financingType === "private" && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">{t("financing.originationFee")}</label>
          <div className="flex">
            <FormattedNumberInput
              value={financing.originationFee || ""}
              onChange={(val) => handleChange("originationFee", val)}
              className="w-full border rounded p-2"
              placeholder="0"
              type={financing.originationFeeType === "currency" ? "currency" : "percentage"}
            />
            <select
              value={financing.originationFeeType || "percentage"}
              onChange={(e) => handleChange("originationFeeType", e.target.value)}
              className="ml-2 border rounded p-2"
            >
              <option value="percentage">%</option>
              <option value="currency">$</option>
            </select>
          </div>
        </div>
      )}

      {financing.financingType !== "private" && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("financing.qualificationRate")}</label>
            <FormattedNumberInput
              value={financing.qualificationRate || ""}
              onChange={(val) => handleChange("qualificationRate", val)}
              className="w-full border rounded p-2"
              placeholder="6.0"
              type="percentage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("financing.debtCoverageRatio")}</label>
            <FormattedNumberInput
              value={financing.debtCoverageRatio || ""}
              onChange={(val) => handleChange("debtCoverageRatio", val)}
              className="w-full border rounded p-2"
              placeholder="1.15"
              //disabled={lockedFields?.debtCoverage}
            />
          </div>
        </div>
      )}
    </div>
  );
}