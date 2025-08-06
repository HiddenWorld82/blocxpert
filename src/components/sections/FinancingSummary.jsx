// src/components/sections/FinancingSummary.jsx
import React from "react";

export default function FinancingSummary({ summary = {} }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Résumé de financement</h2>
      <ul className="text-gray-700">
        <li><strong>Versement mensuel :</strong> {summary.monthlyPayment || 'N/A'} $</li>
        <li><strong>Montant du prêt :</strong> {summary.totalLoan || 'N/A'} $</li>
        <li><strong>Frais d'acquisition :</strong> {summary.totalCosts || 'N/A'} $</li>
        <li><strong>Mise de fonds requise :</strong> {summary.cashRequired || 'N/A'} $</li>
      </ul>
    </div>
  );
}
