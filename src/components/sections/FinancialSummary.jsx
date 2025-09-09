// src/components/sections/FinancialSummary.jsx
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function FinancialSummary({ analysis, advancedExpenses = false }) {
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

  if (advancedExpenses) {
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('financialSummary.title')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financialSummary.grossIncome')}:</span>
            <span className="font-medium">
              {formatMoney(analysis?.totalGrossRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financialSummary.effectiveIncome')}:</span>
            <span className="font-medium">
              {formatMoney(analysis?.effectiveGrossRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financialSummary.operatingExpensesSCHL')}:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.operatingExpensesSCHL)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financialSummary.totalExpenses')}:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-gray-600">{t('financialSummary.netIncomeSCHL')}:</span>
            <span className="font-semibold text-lg">
              {formatMoney(analysis?.netOperatingIncome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financialSummary.effectiveNetIncome')}:</span>
            <span className="font-semibold">
              {formatMoney(analysis?.effectiveNetIncome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('financialSummary.annualDebtService')}:</span>
            <span className="font-medium text-red-600">
              {formatMoney(analysis?.annualDebtService)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-gray-600 font-semibold">{t('financialSummary.annualCashFlow')}:</span>
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
      <h3 className="text-lg font-semibold mb-4">{t('financialSummary.title')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('financialSummary.grossIncome')}:</span>
          <span className="font-medium">{formatMoney(analysis?.totalGrossRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('financialSummary.effectiveIncome')}:</span>
          <span className="font-medium">{formatMoney(analysis?.effectiveGrossRevenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('financialSummary.totalExpenses')}:</span>
          <span className="font-medium text-red-600">
            {formatMoney(analysis?.operatingExpensesTotal)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span className="text-gray-600">{t('financialSummary.netIncome')}:</span>
          <span className="font-semibold text-lg">
            {formatMoney(analysis?.effectiveNetIncome)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('financialSummary.annualDebtService')}:</span>
          <span className="font-medium text-red-600">
            {formatMoney(analysis?.annualDebtService)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span className="text-gray-600 font-semibold">{t('financialSummary.annualCashFlow')}:</span>
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

