// components/BuildingDashboard.jsx
import React from 'react';
import { DollarSign, TrendingUp, BarChart, Building } from 'lucide-react';
import ScenarioList from './ScenarioList';
import { useLanguage } from '../contexts/LanguageContext';

const BuildingDashboard = ({
  property,
  onCreateScenario,
  onEditScenario,
  onViewScenario,
  onEditProperty,
  onBack,
}) => {
  const { t } = useLanguage();

  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatPercent = (value) =>
    value || value === 0 ? `${value.toFixed(1)}%` : '—';

  const pricePerDoorValue =
    property.numberOfUnits && property.purchasePrice
      ? Number(property.purchasePrice) / Number(property.numberOfUnits)
      : null;

  const stats = [
    {
      label: t('building.purchasePrice'),
      value: formatMoney(Number(property.purchasePrice)),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    },
    {
      label: t('building.numberOfUnits'),
      value: property.numberOfUnits || '—',
      icon: <Building className="w-6 h-6 text-gray-600" />,
    },
    {
      label: t('building.pricePerDoor'),
      value: pricePerDoorValue ? formatMoney(pricePerDoorValue) : 'N/A',
      icon: <DollarSign className="w-6 h-6 text-indigo-600" />,
    },
    {
      label: t('building.grossIncome'),
      value: formatMoney(property.totalGrossRevenue),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
    },
    {
      label: t('building.totalExpenses'),
      value: formatMoney(property.totalExpenses),
      icon: <DollarSign className="w-6 h-6 text-red-600" />,
    },
    {
      label: t('building.netIncome'),
      value: formatMoney(property.netOperatingIncome),
      icon: <DollarSign className="w-6 h-6 text-purple-600" />,
    },
    {
      label: t('building.grm'),
      value: property.grossRentMultiplier
        ? property.grossRentMultiplier.toFixed(1)
        : '—',
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
    },
    {
      label: t('building.nim'),
      value: property.netIncomeMultiplier
        ? property.netIncomeMultiplier.toFixed(1)
        : '—',
      icon: <BarChart className="w-6 h-6 text-purple-600" />,
    },
    {
      label: t('building.capRate'),
      value: formatPercent(property.capRate),
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
    },
  ];

  const fullAddress = [
    property.address,
    property.city,
    property.province,
    property.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">{t('building.dashboard.title')}</h2>
            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
              <button
                onClick={onEditProperty}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                {t('edit')}
              </button>
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 text-sm sm:text-base"
              >
                ← {t('back')}
              </button>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">
              {fullAddress || t('home.address.unset')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

          <div className="flex justify-center mb-6">
            <button
              onClick={onCreateScenario}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {t('building.createScenario')}
            </button>
          </div>

          <ScenarioList
            propertyId={property.id}
            onEdit={onEditScenario}
            onView={onViewScenario}
            excludeTypes={["refinancing", "renewal", "optimization", "other"]}
          />
        </div>
      </div>
    </div>
  );
};

export default BuildingDashboard;
