// src/components/sections/FinancingSummary.jsx
import React from "react";

export default function FinancingSummary({
  analysis,
  currentProperty,
  equityAmount,
  scenarioType,
  financing = {},
}) {
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
    ? "Valeur de l'immeuble"
    : "Prix d'achat";
  const downPaymentLabel = isRefinancing ? "Équité figée" : "Mise de fonds";
  const feesLabel =
    scenarioType === "optimization"
      ? "Frais de financement et travaux"
      : isRefinancing
      ? "Frais de financement"
      : "Frais d'acquisition";

  const financingTypeLabels = {
    conventional: "Conventionnel",
    cmhc: "SCHL Standard",
    cmhc_aph: "SCHL APH Select",
    private: "Prêt privé",
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Résumé du Financement</h3>
      <div className="space-y-3">
        {financing.financingType && (
          <div className="flex justify-between">
            <span className="text-gray-600">Type de financement:</span>
            <span className="font-medium">
              {financingTypeLabels[financing.financingType] ||
                financing.financingType}
            </span>
          </div>
        )}
        {financing.financingType === "cmhc_aph" && financing.aphPoints && (
          <div className="flex justify-between">
            <span className="text-gray-600">Points APH:</span>
            <span className="font-medium">{financing.aphPoints}</span>
          </div>
        )}
        {financing.qualificationRate && (
          <div className="flex justify-between">
            <span className="text-gray-600">Taux de qualification:</span>
            <span className="font-medium">
              {formatPercent(financing.qualificationRate)}
            </span>
          </div>
        )}
        {financing.amortization && (
          <div className="flex justify-between">
            <span className="text-gray-600">Amortissement restant:</span>
            <span className="font-medium">{financing.amortization} ans</span>
          </div>
        )}
        {financing.debtCoverageRatio && (
          <div className="flex justify-between">
            <span className="text-gray-600">Ratio couverture dette:</span>
            <span className="font-medium">{financing.debtCoverageRatio}</span>
          </div>
        )}
        {financing.financingType === "private" && financing.ltvRatio && (
          <div className="flex justify-between">
            <span className="text-gray-600">Ratio prêt-valeur:</span>
            <span className="font-medium">{formatPercent(financing.ltvRatio)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">{purchaseLabel}:</span>
          <span className="font-medium">
            {formatMoney(parseFloat(currentProperty?.purchasePrice) || 0)}
          </span>
        </div>
        {!isRenewal && (
          <div className="flex justify-between">
            <span className="text-gray-600">Valeur économique:</span>
            <span className="font-medium">{formatMoney(analysis?.economicValue)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">{isRenewal ? "Solde du prêt" : "Prêt maximal"}:</span>
          <span className="font-medium">
            {formatMoney(
              isRenewal ? analysis?.totalLoanAmount : analysis?.maxLoanAmount
            )}
          </span>
        </div>
        {!isRenewal && analysis?.cmhcPremium > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Prime SCHL:</span>
            <span className="font-medium">{formatMoney(analysis?.cmhcPremium)}</span>
          </div>
        )}
        {!isRenewal && analysis?.cmhcPremium > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Prêt total incluant prime:</span>
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
              <span className="text-gray-600 font-semibold">Retrait d'équité:</span>
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
              <span className="text-gray-600 font-semibold">Investissement total:</span>
              <span className="font-bold text-lg">
                {formatMoney(analysis?.totalInvestment)}
              </span>
            </div>
          )
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Paiement mensuel:</span>
          <span className="font-medium">{formatMoney(analysis?.monthlyPayment)}</span>
        </div>
      </div>
    </div>
  );
}