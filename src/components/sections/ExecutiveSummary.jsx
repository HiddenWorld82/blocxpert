// src/components/sections/ExecutiveSummary.jsx
import React from "react";

export default function ExecutiveSummary({ summary }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Résumé exécutif</h2>
      <p className="text-gray-800">
        Ce projet présente un immeuble de {summary?.units} unités situé à {summary?.address}. Le prix d'achat est estimé à {format(summary?.price)} avec un financement de {format(summary?.loan)}.
      </p>
      <p className="text-gray-800">
        Le cashflow annuel projeté est de {format(summary?.annualCashFlow)} pour un rendement sur mise de fonds de {summary?.cashOnCashReturn?.toFixed(1)} %.
      </p>
    </div>
  );
}

function format(value) {
  return value !== null && value !== undefined
    ? value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })
    : "—";
}
