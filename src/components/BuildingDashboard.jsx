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
  clients = [],
  isCourtierHypo = false,
  onLinkClient,
  readOnly = false,
  staticScenarios = null,
  shareToken = null,
  baseScenarios = null,
  shareCreatorInfo = null,
  shareFilterByCreatorUid = null,
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

  const scenarioTypeLabels = {
    initialFinancing: t('scenario.initialFinancing'),
    refinancing: t('scenario.refinancing'),
    renewal: t('scenario.renewal'),
    optimization: t('scenario.optimization'),
    other: t('scenario.other'),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">{t('building.dashboard.title')}</h2>
            {(!readOnly && (onEditProperty || onBack)) && (
              <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
                {onEditProperty && (
                  <button
                    onClick={onEditProperty}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                  >
                    {t('edit')}
                  </button>
                )}
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                  >
                    ← {t('back')}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">
              {fullAddress || t('home.address.unset')}
            </h3>
            {!readOnly && isCourtierHypo && clients.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm text-gray-600">{t('clients.title')}:</label>
                <select
                  value={property.clientId || ''}
                  onChange={(e) => onLinkClient?.(property.id, e.target.value || null)}
                  className="border rounded px-3 py-1.5 text-sm"
                >
                  <option value="">—</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email || c.id}
                    </option>
                  ))}
                </select>
              </div>
            )}
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

          {!readOnly && (
            <div className="flex justify-center mb-6">
              <button
                onClick={onCreateScenario}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                {t('building.createScenario')}
              </button>
            </div>
          )}

          {staticScenarios && readOnly ? (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 mb-2">{t('building.scenarios')}</h3>
              {staticScenarios
                .filter((s) => !['refinancing', 'renewal', 'optimization', 'other'].includes(s.type))
                .map((sc) => (
                  <div
                    key={sc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <span className="text-sm">
                      {sc.title || sc.name || t('scenario.initialFinancing')}
                      {sc.type ? ` — ${scenarioTypeLabels[sc.type] || sc.type}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewScenario?.(sc)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {t('view')}
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <>
              <ScenarioList
                propertyId={property.id}
                shareToken={shareToken}
                baseScenarios={baseScenarios}
                shareCreatorInfo={shareCreatorInfo}
                shareFilterByCreatorUid={shareFilterByCreatorUid}
                onEdit={onEditScenario}
                onView={onViewScenario}
                excludeTypes={["refinancing", "renewal", "optimization", "other"]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingDashboard;
