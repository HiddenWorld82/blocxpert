import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useRentabilityCalculator from '../../hooks/useRentabilityCalculator';
import BuildingDashboard from '../BuildingDashboard';
import PropertyReport from '../PropertyReport';
import AmortizationPage from '../AmortizationPage';
import FinancingScenarioForm from '../FinancingScenarioForm';
import defaultProperty from '../../defaults/defaultProperty';
import { saveShareScenario, updateShareScenario, addSharedWithMe, getSharedWithMeOnce } from '../../services/shareService';

const lockedFields = { debtCoverage: true, welcomeTax: true };

/**
 * View of a shared property + scenarios (token-based share).
 * When access === 'write', allows creating and editing scenarios (stored in share subcollection).
 */
const SharedPropertyView = ({ shareData, openScenario = null, onBack = null }) => {
  const { currentUser, refreshSharedWithMe } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');
  const [editingScenario, setEditingScenario] = useState(null);
  const [amortizationData, setAmortizationData] = useState(null);
  const addedToDashboardRef = useRef(false);

  useEffect(() => {
    if (openScenario && shareData?.id) {
      setSelectedScenario(openScenario);
      setViewMode('report');
    }
  }, [openScenario?.id, shareData?.id]);

  // When user is logged in and viewing a share link, add it to their "Partagés avec moi" once (if not already there).
  useEffect(() => {
    if (!currentUser?.uid || !shareData?.id || !shareData?.uid || !shareData?.snapshot || addedToDashboardRef.current) return;
    let cancelled = false;
    getSharedWithMeOnce(currentUser.uid)
      .then((items) => {
        if (cancelled) return;
        const alreadyHas = items.some((item) => item.shareToken === shareData.id);
        if (alreadyHas) {
          addedToDashboardRef.current = true;
          return;
        }
        return addSharedWithMe(currentUser.uid, shareData.uid, shareData.id, shareData.snapshot).then(() => {
          if (!cancelled) {
            addedToDashboardRef.current = true;
            refreshSharedWithMe?.();
            navigate('/', { state: { shareAdded: true }, replace: true });
          }
        });
      })
      .catch((e) => console.warn('SharedPropertyView: addSharedWithMe', e));
    return () => { cancelled = true; };
  }, [currentUser?.uid, shareData?.id, shareData?.uid, shareData?.snapshot, refreshSharedWithMe]);

  const snapshot = shareData?.snapshot || {};
  const property = snapshot.property || defaultProperty;
  const baseScenarios = snapshot.scenarios || [];
  const access = (shareData?.access || 'read').toLowerCase();
  const allowSubScenariosEdit = shareData?.allowSubScenariosEdit === true;
  const hasWriteAccess = access === 'write';
  const isWrite = hasWriteAccess && !!currentUser;
  const shareToken = shareData?.id || null;

  const bannerText = isWrite
    ? t('sharedView.badgeWrite')
    : hasWriteAccess && !currentUser
      ? t('sharedView.loginToEdit')
      : t('sharedView.badge');

  const [advancedExpenses] = useState(property?.advancedExpenses ?? false);
  const analysis = useRentabilityCalculator(
    property,
    advancedExpenses,
    lockedFields,
    () => {},
  );

  const propertyWithAnalysis = { ...property, ...analysis, id: shareToken };
  const creatorInfo = currentUser
    ? { createdByUid: currentUser.uid, createdByName: currentUser.displayName || currentUser.email || currentUser.uid }
    : null;

  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <span className="text-amber-800 text-sm font-medium">{bannerText}</span>
        </div>
        <FinancingScenarioForm
          propertyId={shareToken}
          property={propertyWithAnalysis}
          advancedExpenses={advancedExpenses}
          onBack={() => setViewMode('dashboard')}
          onSaved={() => setViewMode('dashboard')}
          onSaveScenario={(data) => saveShareScenario(shareToken, data, creatorInfo)}
          onUpdateScenario={(id, data) => updateShareScenario(shareToken, id, data)}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && editingScenario) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <span className="text-amber-800 text-sm font-medium">{bannerText}</span>
        </div>
        <FinancingScenarioForm
          propertyId={shareToken}
          property={propertyWithAnalysis}
          initialScenario={editingScenario}
          advancedExpenses={advancedExpenses}
          onBack={() => { setViewMode('dashboard'); setEditingScenario(null); }}
          onSaved={() => { setViewMode('dashboard'); setEditingScenario(null); }}
          onSaveScenario={(data) => saveShareScenario(shareToken, data, creatorInfo)}
          onUpdateScenario={(id, data) => updateShareScenario(shareToken, id, data)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
        <span className="text-amber-800 text-sm font-medium">{bannerText}</span>
      </div>
      {!currentUser && shareToken && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-blue-800">{t('sharedView.addToDashboard')}</span>
          <Link
            to={`/login?share=${shareToken}`}
            className="text-blue-700 font-medium underline hover:no-underline"
          >
            {t('auth.login.link')}
          </Link>
          <span className="text-blue-700">|</span>
          <Link
            to={`/signup?share=${shareToken}`}
            className="text-blue-700 font-medium underline hover:no-underline"
          >
            {t('auth.createAccount')}
          </Link>
        </div>
      )}

      {(viewMode !== 'report' || !selectedScenario) && viewMode !== 'amortization' ? (
        <BuildingDashboard
          property={propertyWithAnalysis}
          staticScenarios={isWrite ? null : baseScenarios}
          readOnly={!isWrite}
          shareToken={isWrite ? shareToken : null}
          baseScenarios={isWrite ? baseScenarios : null}
          shareCreatorInfo={isWrite ? creatorInfo : null}
          shareFilterByCreatorUid={isWrite && currentUser ? currentUser.uid : null}
          onCreateScenario={isWrite ? () => setViewMode('create') : undefined}
          onEditScenario={isWrite ? (sc) => { setEditingScenario(sc); setViewMode('edit'); } : undefined}
          onViewScenario={(sc) => { setSelectedScenario(sc); setViewMode('report'); }}
          onBack={onBack}
          clients={[]}
          isCourtierHypo={false}
        />
      ) : viewMode === 'amortization' && amortizationData ? (
        <div className="p-4">
          <AmortizationPage
            analysis={amortizationData.analysis || analysis}
            currentProperty={amortizationData.property || propertyWithAnalysis}
            scenario={amortizationData.scenario}
            scenarioAnalysis={amortizationData.scenarioAnalysis}
            setCurrentStep={(step) => {
              if (step === 'report' || step === 'dashboard') {
                setAmortizationData(null);
                setViewMode('report');
              }
            }}
          />
        </div>
      ) : (
        <div className="p-4">
          <PropertyReport
            currentProperty={propertyWithAnalysis}
            setCurrentStep={(step) => step === 'dashboard' && (setSelectedScenario(null), setViewMode('dashboard'))}
            analysis={analysis}
            onSave={() => {}}
            advancedExpenses={advancedExpenses}
            scenario={selectedScenario}
            onViewAmortization={(property, analysisData, scenarioData, scenarioAnalysis) => {
              setAmortizationData({ property, analysis: analysisData, scenario: scenarioData, scenarioAnalysis });
              setViewMode('amortization');
            }}
            shareToken={shareToken}
            shareFilterByCreatorUid={currentUser?.uid || null}
            baseScenarios={baseScenarios}
            shareCreatorInfo={creatorInfo}
            readOnly={!isWrite}
            allowSubScenariosEdit={allowSubScenariosEdit}
          />
        </div>
      )}
    </div>
  );
};

export default SharedPropertyView;
