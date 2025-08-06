// components/KeyIndicators.jsx
import React from "react";
import { DollarSign, PercentCircle, TrendingUp, PiggyBank, BarChart, ShieldCheck } from "lucide-react";

export default function KeyIndicators({ indicators }) {
  if (!indicators) return null;

  const {
    capRate,
    grossIncomeMultiplier,
    annualCashFlow,
    monthlyCashFlow,
    cashOnCashReturn,
    debtCoverageRatio,
  } = indicators;

  const formatPercent = (value) =>
    value !== null && value !== undefined ? `${value.toFixed(1)} %` : "—";

  const formatMoney = (value) =>
    value !== null && value !== undefined
      ? value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })
      : "—";

  const cards = [
    {
      label: "TGA (Cap Rate)",
      value: formatPercent(capRate),
      icon: <PercentCircle className="w-6 h-6 text-blue-600" />,
    },
    {
      label: "MRB (multiplicateur brut)",
      value: grossIncomeMultiplier?.toFixed(1),
      icon: <BarChart className="w-6 h-6 text-amber-600" />,
    },
    {
      label: "Cashflow annuel",
      value: formatMoney(annualCashFlow),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
    },
    {
      label: "Cashflow mensuel",
      value: formatMoney(monthlyCashFlow),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    },
    {
      label: "Rendement sur mise de fonds",
      value: formatPercent(cashOnCashReturn),
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
    },
    {
      label: "Ratio de couverture de la dette (DCR)",
      value: debtCoverageRatio?.toFixed(2),
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {cards.map(({ label, value, icon }) => (
        <div
          key={label}
          className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex items-center gap-4"
        >
          <div>{icon}</div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
