// src/components/sections/KeyIndicators.jsx
import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart,
  PiggyBank,
  Percent,
  Clock,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function KeyIndicators({ analysis, variant = "acquisition", exclude = [] }) {
  const { t } = useLanguage();
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

  const getColorForChange = (value) => {
    if (value === null || value === undefined) {
      return "text-gray-700";
    }
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const comparison = analysis?.optimizationComparison;
  const baseRevenue = comparison?.base?.totalGrossRevenue ?? null;
  const optimizedRevenue = comparison?.optimized?.totalGrossRevenue ?? null;
  const baseExpenses = comparison?.base?.totalExpenses ?? null;
  const optimizedExpenses = comparison?.optimized?.totalExpenses ?? null;
  const baseNOI = comparison?.base?.netOperatingIncome ?? null;
  const optimizedNOI = comparison?.optimized?.netOperatingIncome ?? null;
  const workCost = comparison?.workCost ?? 0;

  const revenueIncrease =
    baseRevenue !== null && optimizedRevenue !== null
      ? optimizedRevenue - baseRevenue
      : null;
  const expenseReduction =
    baseExpenses !== null && optimizedExpenses !== null
      ? baseExpenses - optimizedExpenses
      : null;
  const noiImprovement =
    baseNOI !== null && optimizedNOI !== null ? optimizedNOI - baseNOI : null;
  const noiIncrease = noiImprovement ?? comparison?.noiIncrease ?? null;
  const investmentEfficiency =
    workCost > 0 && noiIncrease !== null
      ? (noiIncrease / workCost) * 100
      : null;
  const paybackPeriodYears =
    workCost > 0 && noiIncrease > 0 ? workCost / noiIncrease : null;

  let cards = [
    {
      key: "mrb",
      label: t("keyIndicators.mrb"),
      value: analysis.grossRentMultiplier?.toFixed(1) || "—",
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
      color: "text-gray-700",
    },
    {
      key: "mrn",
      label: t("keyIndicators.mrn"),
      value: analysis.netIncomeMultiplier?.toFixed(1) || "—",
      icon: <BarChart className="w-6 h-6 text-indigo-600" />,
      color: "text-gray-700",
    },
    {
      key: "tga",
      label: t("keyIndicators.capRate"),
      value: formatPercent(analysis.capRate),
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      color: analysis.capRate >= 5 ? "text-green-600" : "text-orange-600",
    },
    {
      key: "coc",
      label: t("keyIndicators.coc"),
      value: formatPercent(analysis.cashOnCashReturn),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      color: analysis.cashOnCashReturn >= 8 ? "text-green-600" : "text-orange-600",
    },
    {
      key: "loanPaydownReturn",
      label: t("keyIndicators.loanPaydownReturn"),
      value: formatPercent(analysis.loanPaydownReturn),
      icon: <PiggyBank className="w-6 h-6 text-purple-600" />,
      color: "text-gray-700",
    },
    {
      key: "appreciationReturn",
      label: t("keyIndicators.appreciationReturn"),
      value: formatPercent(analysis.appreciationReturn),
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      color: "text-gray-700",
    },
    {
      key: "valueGeneratedYear1",
      label: t("keyIndicators.valueGeneratedYear1"),
      value: formatMoney(analysis.valueGeneratedYear1),
      icon: <DollarSign className="w-6 h-6 text-indigo-600" />,
      color: analysis.valueGeneratedYear1 >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      key: "totalReturn",
      label: t("keyIndicators.totalReturn"),
      value: formatPercent(analysis.totalReturn),
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      color: "text-gray-700",
    },
    {
      key: "loanValueRatio",
      label: t("keyIndicators.loanValueRatio"),
      value: formatPercent(analysis.loanValueRatio),
      icon: <Percent className="w-6 h-6 text-cyan-600" />,
      color: "text-gray-700",
    },
  ];

  if (variant === "optimization" && comparison) {
    cards = cards.concat([
      {
        key: "revenueIncrease",
        label: t("keyIndicators.revenueIncrease"),
        value: formatMoney(revenueIncrease),
        icon: <TrendingUp className="w-6 h-6 text-green-600" />,
        color: getColorForChange(revenueIncrease),
      },
      {
        key: "expenseReduction",
        label: t("keyIndicators.expenseReduction"),
        value: formatMoney(expenseReduction),
        icon: <TrendingDown className="w-6 h-6 text-green-600" />,
        color: getColorForChange(expenseReduction),
      },
      {
        key: "noiImprovement",
        label: t("keyIndicators.noiImprovement"),
        value: formatMoney(noiImprovement),
        icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
        color: getColorForChange(noiImprovement),
      },
      {
        key: "investmentEfficiency",
        label: t("keyIndicators.investmentEfficiency"),
        value:
          investmentEfficiency !== null
            ? formatPercent(investmentEfficiency)
            : "—",
        icon: <BarChart className="w-6 h-6 text-purple-600" />,
        color: "text-gray-700",
      },
      {
        key: "paybackPeriod",
        label: t("keyIndicators.paybackPeriod"),
        value:
          paybackPeriodYears !== null
            ? `${paybackPeriodYears.toFixed(1)} ${t("keyIndicators.years")}`
            : "—",
        icon: <Clock className="w-6 h-6 text-blue-600" />,
        color:
          paybackPeriodYears !== null && paybackPeriodYears > 10
            ? "text-orange-500"
            : "text-gray-700",
      },
    ]);
  }

  if (variant === "private") {
    cards = cards.concat([
      {
        key: "interestRate",
        label: t("keyIndicators.interestRate"),
        value: formatPercent(analysis.mortgageRate),
        icon: <Percent className="w-6 h-6 text-rose-600" />,
        color: "text-gray-700",
      },
      {
        key: "monthlyInterest",
        label: t("keyIndicators.monthlyInterest"),
        value: formatMoney(analysis.monthlyPayment),
        icon: <DollarSign className="w-6 h-6 text-rose-600" />,
        color: "text-gray-700",
      },
      {
        key: "annualInterest",
        label: t("keyIndicators.totalInterest"),
        value: formatMoney(analysis.annualDebtService),
        icon: <DollarSign className="w-6 h-6 text-red-600" />,
        color: "text-gray-700",
      },
      {
        key: "capitalRequired",
        label: t("keyIndicators.capitalRequired"),
        value: formatMoney(
          (analysis.totalInvestment || 0) + (analysis.annualDebtService || 0),
        ),
        icon: <PiggyBank className="w-6 h-6 text-rose-600" />,
        color: "text-gray-700",
      },
    ]);
  }

  const optimizationKeys = [
    "coc",
    "loanPaydownReturn",
    "appreciationReturn",
    "totalReturn",
    "investmentEfficiency",
    "paybackPeriod",
    "revenueIncrease",
    "expenseReduction",
    "noiImprovement",
  ];

  const filterConfig = {
    future: (card) => !["mrb", "mrn", "tga"].includes(card.key),
    private: (card) =>
      !["coc", "loanPaydownReturn", "appreciationReturn", "totalReturn"].includes(
        card.key,
      ),
    optimization: (card) => optimizationKeys.includes(card.key),
  };

  let visibleCards = cards.filter((card) => {
    if (exclude.includes(card.key)) return false;
    const variantFilter = filterConfig[variant];
    return variantFilter ? variantFilter(card) : true;
  });

  if (variant === "optimization") {
    visibleCards = optimizationKeys
      .map((key) => visibleCards.find((card) => card.key === key))
      .filter(Boolean);
  }

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
