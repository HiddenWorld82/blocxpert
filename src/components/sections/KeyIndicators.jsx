// src/components/sections/KeyIndicators.jsx
import React from "react";
import { DollarSign, TrendingUp, BarChart, ShieldCheck } from "lucide-react";

export default function KeyIndicators({ analysis }) {
  if (!analysis) return null;

  const formatPercent = (value) =>
    value !== null && value !== undefined ? `${value.toFixed(1)}%` : "—";

  const formatMoney = (value) =>
    value !== null && value !== undefined
      ? new Intl.NumberFormat("fr-CA", {
          style: "currency",
          currency: "CAD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      : "—";

  const cards = [
    {
      label: "TGA (Cap Rate)",
      value: formatPercent(analysis.capRate),
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      color: analysis.capRate >= 5 ? "text-green-600" : "text-orange-600"
    },
    {
      label: "Cashflow annuel",
      value: formatMoney(analysis.cashFlow),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      color: analysis.cashFlow >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      label: "Cashflow mensuel",
      value: formatMoney(analysis.cashFlow / 12),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      color: analysis.cashFlow >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      label: "Rendement sur mise de fonds",
      value: formatPercent(analysis.cashOnCashReturn),
      icon: <BarChart className="w-6 h-6 text-indigo-600" />,
      color: analysis.cashOnCashReturn >= 8 ? "text-green-600" : "text-orange-600"
    },
    {
      label: "Ratio de couverture (DCR)",
      value: analysis.actualDebtCoverageRatio?.toFixed(2) || "—",
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      color: analysis.actualDebtCoverageRatio >= 1.15 ? "text-green-600" : "text-red-600"
    },
    {
      label: "Prix par porte",
      value: formatMoney(analysis.pricePerUnit),
      icon: <BarChart className="w-6 h-6 text-amber-600" />,
      color: "text-gray-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map(({ label, value, icon, color }) => (
        <div
          key={label}
          className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-4"
        >
          <div>{icon}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-lg font-semibold ${color}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}