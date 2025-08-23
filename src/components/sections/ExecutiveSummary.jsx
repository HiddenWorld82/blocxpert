// src/components/sections/ExecutiveSummary.jsx
import React from "react";

export default function ExecutiveSummary({ analysis, currentProperty }) {
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
    <div className="bg-blue-50 rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">Résumé Exécutif</h3>
      <div className="prose max-w-none text-gray-700">
        <p>
          Cet immeuble de <strong>{currentProperty?.numberOfUnits || 0} unités</strong> situé au{" "}
          <strong>
            {[
              currentProperty?.address,
              currentProperty?.city,
              currentProperty?.province,
              currentProperty?.postalCode,
            ]
              .filter(Boolean)
              .join(', ') || "adresse non spécifiée"}
          </strong> représente un
          investissement de <strong>{formatMoney(parseFloat(currentProperty?.purchasePrice))}</strong>.
        </p>
        <p className="mt-3">
          Avec un revenu net d'exploitation (NOI) de <strong>{formatMoney(analysis?.netOperatingIncome)}</strong>,
          le projet génère un taux de capitalisation de <strong>{analysis?.capRate?.toFixed(1)}%</strong>.
          Le cashflow annuel projeté est de{" "}
          <strong className={analysis?.cashFlow >= 0 ? "text-green-600" : "text-red-600"}>
            {formatMoney(analysis?.cashFlow)}
          </strong>{" "}
          pour un rendement sur mise de fonds de <strong>{analysis?.cashOnCashReturn?.toFixed(1)}%</strong>.
        </p>
        <p className="mt-3">
          L'investissement total requis (mise de fonds + frais) s'élève à{" "}
          <strong>{formatMoney(analysis?.totalInvestment)}</strong>, avec un paiement hypothécaire
          mensuel de <strong>{formatMoney(analysis?.monthlyPayment)}</strong>.
        </p>
      </div>
    </div>
  );
}