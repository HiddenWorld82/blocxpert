// src/components/sections/FinancingSummary.jsx
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function FinancingSummary({
  analysis,
  currentProperty,
  equityAmount,
  scenarioType,
  financing = {},
}) {
  const { t } = useLanguage();
  const formatMoney = (value) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return `${
      new Intl.NumberFormat("fr-CA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(value))
    }%`;
  };

  const isRefinancing =
    scenarioType === undefined || scenarioType !== "initialFinancing";
  const isRenewal = scenarioType === "renewal";
  const purchaseLabel = isRefinancing
    ? t("financingSummary.propertyValue")
    : t("financingSummary.purchasePrice");
  const downPaymentLabel = isRefinancing
    ? t("financingSummary.trappedEquity")
    : t("financingSummary.downPayment");
  const feesLabel =
    scenarioType === "optimization"
      ? t("financingSummary.financingAndWorksFees")
      : isRefinancing
      ? t("financingSummary.financingFees")
      : t("financingSummary.acquisitionFees");

  const financingTypeLabels = {
    conventional: t("financingSummary.conventional"),
    cmhc: t("financingSummary.cmhc"),
    cmhc_aph: t("financingSummary.cmhc_aph"),
    private: t("financingSummary.private"),
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{t('financingSummary.title')}</h3>
      <div className="space-y-3">
        {financing.financingType && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.financingType')}:</span>
            <span className="font-medium">
              {financingTypeLabels[financing.financingType] ||
                financing.financingType}
            </span>
          </div>
        )}
        {financing.financingType === "cmhc_aph" &&
          financing.aphPoints &&
          !isRenewal && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.aphPoints')}:</span>
            <span className="font-medium">{financing.aphPoints}</span>
          </div>
        )}
        {financing.qualificationRate && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.qualificationRate')}:</span>
            <span className="font-medium">
              {formatPercent(financing.qualificationRate)}
            </span>
          </div>
        )}
        {financing.amortization && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.remainingAmortization')}:</span>
            <span className="font-medium">{financing.amortization} ans</span>
          </div>
        )}
        {financing.debtCoverageRatio && !isRenewal && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.debtCoverageRatio')}:</span>
            <span className="font-medium">{financing.debtCoverageRatio}</span>
          </div>
        )}
        {financing.financingType === "private" && financing.ltvRatio && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.ltvRatio')}:</span>
            <span className="font-medium">{formatPercent(financing.ltvRatio)}</span>
          </div>
        )}
        {financing.financingType === "private" && analysis?.originationFee > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.originationFee')}:</span>
            <span className="font-medium">{formatMoney(analysis.originationFee)}</span>
          </div>
        )}
        {scenarioType !== "optimization" && (
          <div className="flex justify-between">
            <span className="text-gray-600">{purchaseLabel}:</span>
            <span className="font-medium">
              {formatMoney(parseFloat(currentProperty?.purchasePrice) || 0)}
            </span>
          </div>
        )}
        {!isRenewal && (
          <div className="flex justify-between">
          <span className="text-gray-600">{t('financingSummary.borrowingValue')}:</span>
            <span className="font-medium">{formatMoney(analysis?.economicValue)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">{isRenewal ? t('financingSummary.loanBalance') : t('financingSummary.maxLoan')}:</span>
          <span className="font-medium">
            {formatMoney(
              isRenewal ? analysis?.totalLoanAmount : analysis?.maxLoanAmount
            )}
          </span>
        </div>
        {!isRenewal && analysis?.cmhcPremium > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.cmhcPremium')}:</span>
            <span className="font-medium">{formatMoney(analysis?.cmhcPremium)}</span>
          </div>
        )}
        {!isRenewal && analysis?.cmhcPremium > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financingSummary.totalLoanWithPremium')}:</span>
            <span className="font-medium">{formatMoney(analysis?.totalLoanAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">{downPaymentLabel}:</span>
          <span className="font-medium">{formatMoney(analysis?.downPayment)}</span>
        </div>
        {!isRenewal && (
          <div className="flex justify-between">
            <span className="text-gray-600">{feesLabel}:</span>
            <span className="font-medium">{formatMoney(analysis?.acquisitionCosts)}</span>
          </div>
        )}
        {!isRenewal && (
          equityAmount !== undefined ? (
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600 font-semibold">{t('financingSummary.equityWithdrawal')}:</span>
              <span
                className={`font-bold text-lg ${
                  equityAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMoney(equityAmount)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600 font-semibold">{t('financingSummary.totalInvestment')}:</span>
              <span className="font-bold text-lg">
                {formatMoney(analysis?.totalInvestment)}
              </span>
            </div>
          )
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">
            {financing.financingType === "private"
              ? t('financingSummary.monthlyPaymentInterestOnly') + ':'
              : t('financingSummary.monthlyPayment') + ':'}
          </span>
          <span className="font-medium">{formatMoney(analysis?.monthlyPayment)}</span>
        </div>
      </div>
    </div>
  );
}