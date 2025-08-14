// src/components/sections/KeyIndicators.jsx
import React from "react";
import { DollarSign, TrendingUp, BarChart, PiggyBank, Percent } from "lucide-react";

export default function KeyIndicators({ analysis, variant = "acquisition" }) {
  if (!analysis) return null;

  const formatPercent = (value) =>
    value !== null && value !== undefined ? `${value.toFixed(1)}%` : "—";

  const formatMoney = (value) =>
    value !== null && value !== undefined
      ? new Intl.NumberFormat("fr-CA", {
          style: "currency",
          currency: "CAD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      : "—";

  const cards = [
    {
      key: "mrb",
      label: "Multiplicateur de revenu brut (MRB)",
      value: analysis.grossRentMultiplier?.toFixed(1) || "—",
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
      color: "text-gray-700",
    },
    {
      key: "mrn",
      label: "Multiplicateur de revenu net (MRN)",
      value: analysis.netIncomeMultiplier?.toFixed(1) || "—",
      icon: <BarChart className="w-6 h-6 text-indigo-600" />,
      color: "text-gray-700",
    },
    {
      key: "tga",
      label: "TGA (Cap Rate)",
      value: formatPercent(analysis.capRate),
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      color: analysis.capRate >= 5 ? "text-green-600" : "text-orange-600",
    },
    {
      key: "coc",
      label: "Rendement Cash on Cash (CoC)",
      value: formatPercent(analysis.cashOnCashReturn),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      color: analysis.cashOnCashReturn >= 8 ? "text-green-600" : "text-orange-600",
    },
    {
      key: "loanPaydownReturn",
      label: "Rendement capitalisation du prêt (1an)",
      value: formatPercent(analysis.loanPaydownReturn),
      icon: <PiggyBank className="w-6 h-6 text-purple-600" />,
      color: "text-gray-700",
    },
    {
      key: "appreciationReturn",
      label: "Rendement plus-value",
      value: formatPercent(analysis.appreciationReturn),
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      color: "text-gray-700",
    },
    {
      key: "valueGeneratedYear1",
      label: "Valeur générée après l'an 1",
      value: formatMoney(analysis.valueGeneratedYear1),
      icon: <DollarSign className="w-6 h-6 text-indigo-600" />,
      color: analysis.valueGeneratedYear1 >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      key: "totalReturn",
      label: "Rendement global (1 an)",
      value: formatPercent(analysis.totalReturn),
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      color: "text-gray-700",
    },
    {
      key: "loanValueRatio",
      label: "Ratio Prêt Valeur (RPV)",
      value: formatPercent(analysis.loanValueRatio),
      icon: <Percent className="w-6 h-6 text-cyan-600" />,
      color: "text-gray-700",
    }
  ];

  const visibleCards =
    variant === "future"
      ? cards.filter((card) => !["mrb", "mrn", "tga"].includes(card.key))
      : cards;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {visibleCards.map(({ key, label, value, icon, color }) => (
        <div
          key={key}
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