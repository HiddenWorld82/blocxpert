// src/components/sections/FinancialSummary.jsx
import React from "react";

export default function FinancialSummary({ analysis, advancedExpenses = false }) {
  const formatMoney = (value) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (advancedExpenses) {
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Résumé Financier</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Revenus bruts:</span>
            <span className="font-medium">
              {formatMoney(analysis?.totalGrossRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenus effectifs:</span>
            <span className="font-medium">
              {formatMoney(analysis?.effectiveGrossRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dépenses d'exploitation SCHL:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.operatingExpensesSCHL)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dépenses totales SCHL:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.schlTotalExpenses)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dépenses totales:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-gray-600">Revenu net SCHL (NOI):</span>
            <span className="font-semibold text-lg">
              {formatMoney(analysis?.netOperatingIncome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenu net effectif:</span>
            <span className="font-semibold">
              {formatMoney(analysis?.effectiveNetIncome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service de dette annuel:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.annualDebtService)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-gray-600 font-semibold">Cash Flow annuel:</span>
            <span
              className={`font-bold text-lg ${
                analysis?.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatMoney(analysis?.cashFlow)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Résumé Financier</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Revenus bruts:</span>
          <span className="font-medium">{formatMoney(analysis?.totalGrossRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Revenus effectifs:</span>
          <span className="font-medium">{formatMoney(analysis?.effectiveGrossRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Dépenses totales:</span>
          <span className="font-medium text-red-600">
            {formatMoney(analysis?.totalExpenses)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span className="text-gray-600">Revenu net (NOI):</span>
          <span className="font-semibold text-lg">
            {formatMoney(analysis?.effectiveNetIncome)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service de dette annuel:</span>
          <span className="font-medium text-red-600">
            {formatMoney(analysis?.annualDebtService)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span className="text-gray-600 font-semibold">Cash Flow annuel:</span>
          <span className={`font-bold text-lg ${
            analysis?.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatMoney(analysis?.cashFlow)}
          </span>
        </div>
      </div>
    </div>
  );
}

