// components/BuildingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart, Building, FileStack, FileCheck } from 'lucide-react';
import ScenarioList from './ScenarioList';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeFinancementDossiersForProperty,
  subscribeFinancementDossiersByPropertyAndBroker,
  cancelFinancementDossier,
} from '../services/financementDossierService';
import RequestDossierModal from './financementDossier/RequestDossierModal';

const BuildingDashboard = ({
  property,
  onCreateScenario,
  onEditScenario,
  onViewScenario,
  onEditProperty,
  onBack,
  onOpenProjectDocuments = null,
  onOpenFinancementDossier = null,
  clients = [],
  isCourtierHypo = false,
  readOnly = false,
  staticScenarios = null,
  shareToken = null,
  baseScenarios = null,
  shareCreatorInfo = null,
  shareFilterByCreatorUid = null,
  additionalScenariosFromShares = null,
}) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [financementDossiers, setFinancementDossiers] = useState([]);
  const [brokerDossiersForThisProperty, setBrokerDossiersForThisProperty] = useState([]);
  const [requestDossierModalOpen, setRequestDossierModalOpen] = useState(false);
  const [cancelDossierConfirm, setCancelDossierConfirm] = useState(null);
  const isPropertyOwner = currentUser?.uid === property?.uid;
  const isBrokerViewingClientProperty =
    property?.brokerUid === currentUser?.uid && property?.uid !== currentUser?.uid;

  useEffect(() => {
    if (!property?.id || !property?.uid || !isPropertyOwner) return;
    return subscribeFinancementDossiersForProperty(property.id, property.uid, setFinancementDossiers);
  }, [property?.id, property?.uid, isPropertyOwner]);

  useEffect(() => {
    if (!property?.id || !currentUser?.uid || !isBrokerViewingClientProperty) return;
    return subscribeFinancementDossiersByPropertyAndBroker(
      property.id,
      currentUser.uid,
      setBrokerDossiersForThisProperty
    );
  }, [property?.id, currentUser?.uid, isBrokerViewingClientProperty]);
  // Owner can edit/delete any scenario; broker viewing client property only their own. Share-created scenarios are not editable (form saves to property only) but owner can delete them.
  const canEditScenarioFn = (sc) =>
    !sc.shareToken && (isPropertyOwner || (isBrokerViewingClientProperty && sc.createdByUid === currentUser?.uid));
  const canDeleteScenarioFn = (sc) =>
    isPropertyOwner || (isBrokerViewingClientProperty && !sc.shareToken && sc.createdByUid === currentUser?.uid);

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
            {isCourtierHypo && property.fromClient && property.clientId && clients.length > 0 && (() => {
              const client = clients.find((c) => c.id === property.clientId);
              if (!client) return null;
              return (
                <p className="mt-2 text-sm text-gray-600">
                  {t('building.propertyOfClient')} {client.name || client.email || client.id}
                </p>
              );
            })()}
            {isBrokerViewingClientProperty && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestDossierModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm"
                  >
                    <FileCheck className="w-5 h-5" />
                    {t('financementDossier.sendChecklist')}
                  </button>
                  {brokerDossiersForThisProperty.length > 0 && onOpenFinancementDossier && (
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenFinancementDossier(brokerDossiersForThisProperty[0])}
                        className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200 text-sm"
                      >
                        {t('financementDossier.open')} ({t(`financementDossier.status_${brokerDossiersForThisProperty[0].status || 'not_started'}`)})
                      </button>
                      {brokerDossiersForThisProperty[0].status !== 'submitted' && (
                        cancelDossierConfirm === brokerDossiersForThisProperty[0].id ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <button
                              type="button"
                              onClick={async () => {
                                await cancelFinancementDossier(brokerDossiersForThisProperty[0].id);
                                setCancelDossierConfirm(null);
                              }}
                              className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              {t('confirm')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancelDossierConfirm(null)}
                              className="px-2 py-1 rounded border hover:bg-gray-100"
                            >
                              {t('cancel')}
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCancelDossierConfirm(brokerDossiersForThisProperty[0].id)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 text-sm"
                          >
                            {t('financementDossier.cancelRequest')}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
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
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {onOpenProjectDocuments && isPropertyOwner && (
                <button
                  type="button"
                  onClick={onOpenProjectDocuments}
                  className="w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <FileStack className="w-5 h-5" />
                  {t('building.projectDocuments')}
                </button>
              )}
              <button
                onClick={onCreateScenario}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2"
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
              {isPropertyOwner && (property?.sharedWithBrokerUids?.length > 0 || financementDossiers.length > 0) && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">{t('financementDossier.sectionTitle')}</h3>
                  {financementDossiers.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('financementDossier.noDossiersYet')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {financementDossiers.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <span className="text-sm text-gray-700">
                            {d.brokerDisplayName || d.brokerUid || 'Broker'}
                            <span className="ml-2 text-gray-500">
                              — {t(`financementDossier.status_${d.status || 'not_started'}`)}
                            </span>
                          </span>
                          {onOpenFinancementDossier && (
                            <button
                              type="button"
                              onClick={() => onOpenFinancementDossier(d)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {t('financementDossier.open')}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <ScenarioList
                propertyId={property.id}
                shareToken={shareToken}
                baseScenarios={baseScenarios}
                shareCreatorInfo={shareCreatorInfo}
                shareFilterByCreatorUid={shareFilterByCreatorUid}
                additionalScenariosFromShares={additionalScenariosFromShares}
                onEdit={onEditScenario}
                onView={onViewScenario}
                excludeTypes={["refinancing", "renewal", "optimization", "other"]}
                canEditScenario={!shareToken ? canEditScenarioFn : undefined}
                canDeleteScenario={!shareToken ? canDeleteScenarioFn : undefined}
                creatorUid={!shareToken ? currentUser?.uid : undefined}
              />
              {requestDossierModalOpen && (
                <RequestDossierModal
                  property={property}
                  existingDossiers={brokerDossiersForThisProperty}
                  onClose={() => setRequestDossierModalOpen(false)}
                  onRequested={() => setRequestDossierModalOpen(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingDashboard;
