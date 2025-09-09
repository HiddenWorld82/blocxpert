// src/components/sections/ExecutiveSummary.jsx
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ExecutiveSummary({ analysis, currentProperty }) {
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

  const fullAddress = [
    currentProperty?.address,
    currentProperty?.city,
    currentProperty?.province,
    currentProperty?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-blue-50 rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">{t('executiveSummary.title')}</h3>
      <div className="prose max-w-none text-gray-700">
        <p>
          {t('executiveSummary.p1.part1')}{' '}
          <strong>{currentProperty?.numberOfUnits || 0} {t('executiveSummary.units')}</strong>{' '}
          {t('executiveSummary.p1.part2')}{' '}
          <strong>{fullAddress || t('executiveSummary.addressNotSpecified')}</strong>{' '}
          {t('executiveSummary.p1.part3')}{' '}
          <strong>{formatMoney(parseFloat(currentProperty?.purchasePrice))}</strong>.
        </p>
        <p className="mt-3">
          {t('executiveSummary.p2.part1')}{' '}
          <strong>{formatMoney(analysis?.netOperatingIncome)}</strong>,{' '}
          {t('executiveSummary.p2.part2')}{' '}
          <strong>{analysis?.capRate?.toFixed(1)}%</strong>.{' '}
          {t('executiveSummary.p2.part3')}{' '}
          <strong className={analysis?.cashFlow >= 0 ? "text-green-600" : "text-red-600"}>
            {formatMoney(analysis?.cashFlow)}
          </strong>{' '}
          {t('executiveSummary.p2.part4')}{' '}
          <strong>{analysis?.cashOnCashReturn?.toFixed(1)}%</strong>.
        </p>
        <p className="mt-3">
          {t('executiveSummary.p3.part1')}{' '}
          <strong>{formatMoney(analysis?.totalInvestment)}</strong>,{' '}
          {t('executiveSummary.p3.part2')}{' '}
          <strong>{formatMoney(analysis?.monthlyPayment)}</strong>.
        </p>
      </div>
    </div>
  );
}