// src/components/sections/FinancingSummary.jsx
import React from "react";

export default function FinancingSummary({ summary }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Résumé du financement</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryLine label="Mensualité hypothécaire" value={summary?.monthlyPayment} />
        <SummaryLine label="Total du prêt" value={summary?.totalLoan} />
        <SummaryLine label="Frais d'acquisition totaux" value={summary?.totalCosts} />
        <SummaryLine label="Mise de fonds" value={summary?.cashRequired} />
      </div>
    </div>
  );
}

function SummaryLine({ label, value }) {
  const formatted =
    value !== null && value !== undefined
      ? value.toLocaleString("fr-CA", {
          style: "currency",
          currency: "CAD",
        })
      : "—";

  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold">{formatted}</p>
    </div>
  );
}