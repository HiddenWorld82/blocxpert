// components/BuildingDashboard.jsx
import React from 'react';
import { DollarSign, TrendingUp, BarChart, Percent } from 'lucide-react';

const BuildingDashboard = ({ property, onCreateScenario }) => {
  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatPercent = (value) =>
    value || value === 0 ? `${value.toFixed(1)}%` : '—';

  const pricePerDoor = property.numberOfUnits
    ? (property.purchasePrice / property.numberOfUnits).toLocaleString('fr-CA')
    : 'N/A';

  const stats = [
    {
      label: 'Revenus totaux',
      value: formatMoney(property.totalGrossRevenue),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    },
    {
      label: 'Dépenses totales',
      value: formatMoney(property.totalExpenses),
      icon: <DollarSign className="w-6 h-6 text-red-600" />,
    },
    {
      label: "Revenu net d'exploitation (NOI)",
      value: formatMoney(property.netOperatingIncome),
      icon: <DollarSign className="w-6 h-6 text-indigo-600" />,
    },
    {
      label: 'Cashflow annuel',
      value: formatMoney(property.cashFlow),
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
    },
    {
      label: 'Multiplicateur de revenu brut (MRB)',
      value: property.grossRentMultiplier
        ? property.grossRentMultiplier.toFixed(1)
        : '—',
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
    },
    {
      label: 'Multiplicateur de revenu net (MRN)',
      value: property.netIncomeMultiplier
        ? property.netIncomeMultiplier.toFixed(1)
        : '—',
      icon: <BarChart className="w-6 h-6 text-purple-600" />,
    },
    {
      label: 'TGA (Cap Rate)',
      value: formatPercent(property.capRate),
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
    },
    {
      label: 'Rendement Cash on Cash',
      value: formatPercent(property.cashOnCashReturn),
      icon: <Percent className="w-6 h-6 text-cyan-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Tableau de bord de l'immeuble</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">
              {property.address || 'Adresse non spécifiée'}
            </h3>
            <p className="text-gray-600">
              {property.numberOfUnits} unités •{' '}
              {Number(property.purchasePrice).toLocaleString('fr-CA')}$ •{' '}
              {pricePerDoor}$/porte
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                {icon}
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-lg font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onCreateScenario}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Créer un scénario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingDashboard;
