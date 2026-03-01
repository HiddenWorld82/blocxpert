import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useRentabilityCalculator from '../../hooks/useRentabilityCalculator';
import BuildingDashboard from '../BuildingDashboard';
import PropertyReport from '../PropertyReport';
import FinancingScenarioForm from '../FinancingScenarioForm';
import defaultProperty from '../../defaults/defaultProperty';
import { saveShareScenario, updateShareScenario } from '../../services/shareService';

const lockedFields = { debtCoverage: true, welcomeTax: true };

/**
 * View of a shared property + scenarios (token-based share).
 * When access === 'write', allows creating and editing scenarios (stored in share subcollection).
 */
const SharedPropertyView = ({ shareData, openScenario = null, onBack = null }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');
  const [editingScenario, setEditingScenario] = useState(null);

  useEffect(() => {
    if (openScenario && shareData?.id) {
      setSelectedScenario(openScenario);
      setViewMode('report');
    }
  }, [openScenario?.id, shareData?.id]);

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
      : t('sharedView.badge') + ' — ' + t('sharedView.writtenBy');

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

      {viewMode !== 'report' || !selectedScenario ? (
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
      ) : (
        <div className="p-4">
          <PropertyReport
            currentProperty={propertyWithAnalysis}
            setCurrentStep={(step) => step === 'dashboard' && (setSelectedScenario(null), setViewMode('dashboard'))}
            analysis={analysis}
            onSave={() => {}}
            advancedExpenses={advancedExpenses}
            scenario={selectedScenario}
            onViewAmortization={() => {}}
            shareToken={shareToken}
            shareFilterByCreatorUid={currentUser?.uid || null}
            baseScenarios={baseScenarios}
            shareCreatorInfo={creatorInfo}
          />
        </div>
      )}
    </div>
  );
};

export default SharedPropertyView;
