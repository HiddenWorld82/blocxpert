// src/components/sections/ExecutiveSummary.jsx
import React from "react";

export default function ExecutiveSummary({ summary = {} }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Résumé exécutif</h2>
      <ul className="text-gray-700">
        <li><strong>Adresse :</strong> {summary.address || 'N/A'}</li>
        <li><strong>Nombre d'unités :</strong> {summary.units || 'N/A'}</li>
        <li><strong>Prix d'achat :</strong> {summary.price || 'N/A'} $</li>
        <li><strong>Montant du prêt :</strong> {summary.loan || 'N/A'} $</li>
        <li><strong>Revenu net annuel :</strong> {summary.annualCashFlow || 'N/A'} $</li>
        <li><strong>Retour sur mise de fonds :</strong> {summary.cashOnCashReturn || 'N/A'} %</li>
      </ul>
    </div>
  );
}
