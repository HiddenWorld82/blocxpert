// src/components/sections/FinancingSummary.jsx
import React from "react";

export default function FinancingSummary({ analysis, currentProperty, equityAmount }) {
  const formatMoney = (value) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Résumé du Financement</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Prix d'achat:</span>
          <span className="font-medium">
            {formatMoney(parseFloat(currentProperty?.purchasePrice) || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Prêt maximal:</span>
          <span className="font-medium">{formatMoney(analysis?.maxLoanAmount)}</span>
        </div>
        {analysis?.cmhcPremium > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Prime SCHL:</span>
            <span className="font-medium">{formatMoney(analysis?.cmhcPremium)}</span>
          </div>
        )}
        {analysis?.cmhcPremium > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Prêt total incluant prime:</span>
          <span className="font-medium">{formatMoney(analysis?.totalLoanAmount)}</span>
        </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Mise de fonds:</span>
          <span className="font-medium">{formatMoney(analysis?.downPayment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Frais d'acquisition:</span>
          <span className="font-medium">{formatMoney(analysis?.acquisitionCosts)}</span>
        </div>
        {equityAmount !== undefined ? (
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
            <span className="font-bold text-lg">{formatMoney(analysis?.totalInvestment)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Paiement mensuel:</span>
          <span className="font-medium">{formatMoney(analysis?.monthlyPayment)}</span>
        </div>
      </div>
    </div>
  );
}