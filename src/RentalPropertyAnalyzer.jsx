// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyForm from './components/PropertyForm';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import AmortizationPage from './components/AmortizationPage';
import BuildingDashboard from './components/BuildingDashboard';
import FinancingScenarioForm from './components/FinancingScenarioForm';
import AboutPage from './components/AboutPage';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import defaultProperty from './defaults/defaultProperty';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import {
  saveProperty,
  updateProperty,
  deleteProperty,
  exportProperty,
  importSharedProperty,
} from './services/dataService';
import Header from './components/Header';
import OnboardingModal from './components/onboarding/OnboardingModal';
import ClientsPage from './components/clients/ClientsPage';
import MarketParamsPage from './components/marketParams/MarketParamsPage';
import ShareModal from './components/share/ShareModal';
import ShareWithBrokerModal from './components/share/ShareWithBrokerModal';
import SharedPropertyView from './components/shared/SharedPropertyView';
import { getShare, markSharedWithMeSeen, removeSharedWithMe, getSharesByProperty, getShareScenariosOnce, cleanupPropertyShares } from './services/shareService';
import { getClients, getClient, getInviteByToken, updateClient } from './services/clientsService';
import { setUserProfile, clearBrokerLink } from './services/userProfileService';

const RentalPropertyAnalyzer = () => {
  const { currentUser, userProfile, properties, propertiesLoading, sharedWithMe, refreshSharedWithMe, refreshUserProfile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('home');
  const [currentProperty, setCurrentProperty] = useState(defaultProperty);
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [amortizationData, setAmortizationData] = useState(null);
  const [clients, setClients] = useState([]);
  const [shareModalPropertyId, setShareModalPropertyId] = useState(null);
  const [shareWithBrokerPropertyId, setShareWithBrokerPropertyId] = useState(null);
  const [invitationAcceptedMessage, setInvitationAcceptedMessage] = useState(null);
  const [viewingShareData, setViewingShareData] = useState(null);
  const [sharedScenariosFromClients, setSharedScenariosFromClients] = useState([]);
  const [lockedFields] = useState({
    //maintenance: false,
    //concierge: false,
    debtCoverage: true,
    welcomeTax: true
  });

  const analysis = useRentabilityCalculator(
    currentProperty,
    advancedExpenses,
    lockedFields,
    setCurrentProperty,
  );

  useEffect(() => {
    if (userProfile?.persona === 'courtier_hypo' && currentUser?.uid) {
      const unsub = getClients(currentUser.uid, setClients);
      return () => {
        const u = unsub;
        queueMicrotask(() => u?.());
      };
    }
  }, [userProfile?.persona, currentUser?.uid]);

  useEffect(() => {
    const importShared = async () => {
      const params = new URLSearchParams(window.location.search);
      const shared = params.get('share');
      if (!shared || !currentUser) return;
      if (shared.length === 32 && /^[0-9a-fA-F]+$/.test(shared)) return;
      try {
        const data = JSON.parse(decodeURIComponent(atob(shared)));
        await importSharedProperty(data, currentUser.uid);
        alert(t('property.import.success'));
      } catch (e) {
        console.error('Import error', e);
      } finally {
        params.delete('share');
        const newUrl = `${window.location.pathname}${
          params.toString() ? `?${params.toString()}` : ''
        }`;
        window.history.replaceState({}, '', newUrl);
      }
    };
    importShared();
  }, [currentUser, t]);

  // When an existing investor opens the invitation link and is already logged in, link broker–client
  useEffect(() => {
    if (!currentUser || !refreshUserProfile) return;
    const params = new URLSearchParams(location.search);
    const invitationToken = params.get('invitation');
    if (!invitationToken) return;
    let cancelled = false;
    getInviteByToken(invitationToken)
      .then(async (inviteData) => {
        if (!inviteData?.clientId || cancelled) return;
        await updateClient(inviteData.clientId, { clientUserId: currentUser.uid });
        await setUserProfile(currentUser.uid, {
          persona: 'investisseur',
          onboardingCompleted: true,
          brokerClientId: inviteData.clientId,
          brokerUid: inviteData.brokerUid,
        });
        await refreshUserProfile();
        if (cancelled) return;
        setInvitationAcceptedMessage(true);
        params.delete('invitation');
        const search = params.toString() ? `?${params.toString()}` : '';
        navigate(`/${search}`, { replace: true });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentUser?.uid, location.search, navigate, refreshUserProfile]);

  const handleShare = async (propertyId) => {
    if (userProfile?.persona === 'courtier_hypo') {
      const property = properties?.find((p) => p.id === propertyId);
      if (property?.fromClient) return; // Ne pas permettre au courtier de partager un immeuble partagé par un client (données confidentielles)
      setShareModalPropertyId(propertyId);
      return;
    }
    // Partager avec le courtier uniquement si un courtier est encore associé (vérifier que le client existe côté courtier)
    if (userProfile?.brokerUid && userProfile?.brokerClientId) {
      try {
        const client = await getClient(userProfile.brokerClientId);
        if (!client || client.uid !== userProfile.brokerUid) {
          await clearBrokerLink(currentUser?.uid);
          refreshUserProfile?.();
          setShareModalPropertyId(propertyId);
          return;
        }
      } catch (e) {
        console.warn('handleShare: getClient failed', e);
        setShareModalPropertyId(propertyId);
        return;
      }
      setShareWithBrokerPropertyId(propertyId);
      return;
    }
    // Sinon partager par courriel (même options : Lecture, Lecture/Écriture, sous-scénarios)
    setShareModalPropertyId(propertyId);
  };

  const handleSave = async () => {
    const fieldsToSave = [
      'address',
      'city',
      'clientId',
      'province',
      'postalCode',
      'askingPrice',
      'purchasePrice',
      'municipalEvaluation',
      'numberOfUnits',
      'annualRent',
      'parkingRevenue',
      'internetRevenue',
      'storageRevenue',
      'otherRevenue',
      'vacancyRate',
      'insurance',
      'municipalTaxes',
      'schoolTaxes',
      'electricityHeating',
      'heating',
      'electricity',
      'maintenance',
      'managementRate',
      'concierge',
      'landscaping',
      'snowRemoval',
      'extermination',
      'fireInspection',
      'advertising',
      'legal',
      'accounting',
      'elevator',
      'cableInternet',
      'appliances',
      'garbage',
      'washerDryer',
      'hotWater',
      'operatingExpenses',
      'otherExpenses',
      'structureType',
      'numFridges',
      'numStoves',
      'numDishwashers',
      'numWashers',
      'numDryers',
      'numHeatPumps',
      'numElevators',
      'cmhcAnalysis',
      'cmhcTax',
      'welcomeTax',
    ];
    const baseProperty = { structureType: 'woodFrame', ...currentProperty };
    const propertyData = fieldsToSave.reduce((acc, key) => {
      const value = baseProperty[key];
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {});
    // Ne pas écraser uid quand le courtier sauvegarde un immeuble client : garder le propriétaire (client).
    const isClientProperty = currentProperty.fromClient || currentProperty.uid !== currentUser?.uid;
    const ownerUid = isClientProperty && currentProperty.uid ? currentProperty.uid : currentUser.uid;
    const propertyWithAnalysis = {
      ...propertyData,
      advancedExpenses,
      ...analysis,
      uid: ownerUid,
      ...(userProfile?.brokerClientId && !isClientProperty && {
        brokerUid: userProfile.brokerUid,
        brokerClientId: userProfile.brokerClientId,
      }),
      ...(currentProperty.fromClient && currentProperty.brokerUid && {
        brokerUid: currentProperty.brokerUid,
        clientId: currentProperty.clientId,
      }),
    };
    const cleanProperty = Object.fromEntries(
      Object.entries(propertyWithAnalysis).filter(([, v]) => v !== undefined)
    );
    if (currentProperty.id) {
      
      await updateProperty(currentProperty.id, cleanProperty);
      setCurrentProperty({ ...currentProperty, ...cleanProperty });
    } else {
      const newId = await saveProperty(cleanProperty);
      setCurrentProperty({ ...cleanProperty, id: newId });
    }
    setCurrentStep('dashboard');
  };

  const handleViewAmortization = (
    property,
    analysisData,
    scenarioData,
    scenarioAnalysis,
  ) => {
    setAmortizationData({
      property,
      analysis: analysisData,
      scenario: scenarioData,
      scenarioAnalysis,
    });
    setCurrentStep('amortization');
  };

  const resetProperty = () => {
    setCurrentProperty(defaultProperty);
    setAdvancedExpenses(false);
    setCurrentStep('form');
  };

  const handleLinkClient = async (propertyId, clientId) => {
    if (!propertyId) return;
    try {
      await updateProperty(propertyId, { clientId: clientId || undefined });
      setCurrentProperty((prev) =>
        prev.id === propertyId ? { ...prev, clientId: clientId || undefined } : prev
      );
    } catch (e) {
      console.error(e);
    }
  };

  const isCourtierHypo = userProfile?.persona === 'courtier_hypo';

  const handleDeleteProperty = async (propertyId) => {
    if (!propertyId || !currentUser?.uid) return;
    try {
      try {
        await cleanupPropertyShares(currentUser.uid, propertyId);
      } catch (e) {
        console.error('handleDeleteProperty: cleanupPropertyShares failed', e);
        throw e;
      }
      try {
        await deleteProperty(propertyId);
      } catch (e) {
        console.error('handleDeleteProperty: deleteProperty failed', e);
        throw e;
      }
    } catch (e) {
      console.error(e);
      alert((t('share.error') || 'Erreur') + ': ' + (e?.message || e));
    }
  };

  // When investor views home, refresh "Partagés avec moi" so entries whose share was deleted by broker disappear
  useEffect(() => {
    if (currentStep === 'home' && currentUser?.uid && userProfile?.persona !== 'courtier_hypo' && refreshSharedWithMe) {
      refreshSharedWithMe();
    }
  }, [currentStep, currentUser?.uid, userProfile?.persona, refreshSharedWithMe]);

  useEffect(() => {
    if (
      currentStep !== 'dashboard' ||
      !currentProperty?.id ||
      !currentProperty?.fromClient ||
      currentProperty?.brokerUid !== currentUser?.uid ||
      currentProperty?.brokerSeenAt
    ) return;
    const markSeen = async () => {
      try {
        await updateProperty(currentProperty.id, { brokerSeenAt: new Date() });
        setCurrentProperty((prev) => ({ ...prev, brokerSeenAt: new Date() }));
      } catch (e) {
        console.error(e);
      }
    };
    markSeen();
  }, [currentStep, currentProperty?.id, currentProperty?.fromClient, currentProperty?.brokerUid, currentProperty?.brokerSeenAt, currentUser?.uid]);

  // Charger les sous-scénarios créés par les clients dans les partages (côté courtier propriétaire).
  // Garder la liste en dashboard ET en report pour afficher la section dans le Profitability Analysis Report.
  useEffect(() => {
    const onDashboardOrReport = currentStep === 'dashboard' || currentStep === 'report';
    if (
      !onDashboardOrReport ||
      !currentProperty?.id ||
      !currentUser?.uid ||
      currentProperty?.uid !== currentUser?.uid
    ) {
      setSharedScenariosFromClients([]);
      return;
    }
    let cancelled = false;
    getSharesByProperty(currentUser.uid, currentProperty.id)
      .then((shares) => {
        if (cancelled) return;
        return Promise.all(
          shares.map((s) =>
            getShareScenariosOnce(s.id).then((scenarios) =>
              scenarios.map((sc) => ({ ...sc, shareToken: s.id }))
            )
          )
        );
      })
      .then((arrays) => {
        if (!cancelled && arrays) setSharedScenariosFromClients(arrays.flat());
      })
      .catch((e) => {
        if (!cancelled) {
          console.warn('Load shared scenarios from clients:', e);
          setSharedScenariosFromClients([]);
        }
      });
    return () => { cancelled = true; };
  }, [currentStep, currentProperty?.id, currentProperty?.uid, currentUser?.uid]);

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingModal />
      {invitationAcceptedMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md px-4 py-3 bg-green-100 border border-green-300 rounded-lg text-green-800 shadow flex items-center justify-between gap-4">
          <p className="font-medium">{t('shareWithBroker.invitationLinked')}</p>
          <button
            type="button"
            onClick={() => setInvitationAcceptedMessage(null)}
            className="text-green-600 hover:text-green-800 text-xl leading-none"
            aria-label={t('cancel')}
          >
            ×
          </button>
        </div>
      )}
      {viewingShareData && (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={async () => {
                if (viewingShareData.sharedDocId && currentUser?.uid) {
                  try {
                    await markSharedWithMeSeen(currentUser.uid, viewingShareData.sharedDocId);
                  } catch (e) {
                    console.error(e);
                  }
                }
                setViewingShareData(null);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← {t('back')}
            </button>
            {viewingShareData.sharedDocId && currentUser?.uid && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await removeSharedWithMe(currentUser.uid, viewingShareData.sharedDocId, viewingShareData.shareData?.id);
                  } catch (e) {
                    console.error(e);
                  }
                  setViewingShareData(null);
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                {t('home.removeFromDashboard')}
              </button>
            )}
          </div>
          <SharedPropertyView
            shareData={viewingShareData.shareData}
            openScenario={viewingShareData.openScenario}
            onBack={() => setViewingShareData(null)}
          />
        </div>
      )}
      {!viewingShareData && (
        <>
      {shareModalPropertyId && (
        <ShareModal
          propertyId={shareModalPropertyId}
          onClose={() => setShareModalPropertyId(null)}
          onShared={() => {}}
        />
      )}
      {shareWithBrokerPropertyId && (
        <ShareWithBrokerModal
          propertyId={shareWithBrokerPropertyId}
          onClose={() => setShareWithBrokerPropertyId(null)}
          onShared={(id) => {
            setShareWithBrokerPropertyId(null);
            setCurrentProperty((prev) => (prev?.id === id ? { ...prev, brokerUid: userProfile?.brokerUid, clientId: userProfile?.brokerClientId } : prev));
          }}
        />
      )}
      <Header
        onNavigateToClients={isCourtierHypo ? () => setCurrentStep('clients') : undefined}
        onNavigateToMarketParams={undefined}
      />
      {propertiesLoading ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-gray-700">{t('loading')}</span>
        </div>
      ) : (
        <>
          {currentStep === 'home' && (
            <HomeScreen
              properties={properties}
              sharedWithMe={sharedWithMe || []}
              onSelectSharedWithMe={async (docId, shareToken) => {
                const shareData = await getShare(shareToken);
                if (shareData) setViewingShareData({ shareData, sharedDocId: docId });
              }}
              onRemoveSharedWithMe={currentUser?.uid ? (docId, shareToken) => removeSharedWithMe(currentUser.uid, docId, shareToken) : undefined}
              onNew={resetProperty}
              onSelect={(property) => {
                setCurrentProperty(property);
                setAdvancedExpenses(property.advancedExpenses || false);
                setCurrentStep('dashboard');
              }}
              onDelete={handleDeleteProperty}
              onShare={handleShare}
              onAbout={() => setCurrentStep('about')}
              currentUserId={currentUser?.uid}
              clients={clients}
              isBrokerView={isCourtierHypo}
            />
          )}
          {currentStep === 'form' && (
            <PropertyForm
              currentProperty={currentProperty}
              setCurrentProperty={setCurrentProperty}
              setCurrentStep={setCurrentStep}
              advancedExpenses={advancedExpenses}
              setAdvancedExpenses={setAdvancedExpenses}
              onSave={handleSave}
            />
          )}
          {currentStep === 'dashboard' && (
            <BuildingDashboard
              property={currentProperty}
              onCreateScenario={() => {
                setCurrentScenario(null);
                setCurrentStep('scenario');
              }}
              onEditScenario={(sc) => {
                setCurrentScenario(sc);
                setCurrentStep('scenario');
              }}
              onViewScenario={(sc) => {
                setCurrentScenario(sc);
                setCurrentStep('report');
              }}
              onEditProperty={() => setCurrentStep('form')}
              onBack={() => setCurrentStep('home')}
              clients={clients}
              isCourtierHypo={isCourtierHypo}
              onLinkClient={handleLinkClient}
            />
          )}
          {currentStep === 'scenario' && (
            <FinancingScenarioForm
              propertyId={currentProperty.id}
              property={currentProperty}
              advancedExpenses={advancedExpenses}
              initialScenario={currentScenario || {}}
              onSaved={(sc) => {
                setCurrentScenario(sc);
                setCurrentStep('report');
              }}
              onBack={() => setCurrentStep('dashboard')}
            />
          )}
          {currentStep === 'report' && (
            <PropertyReport
              currentProperty={currentProperty}
              setCurrentStep={setCurrentStep}
              analysis={analysis}
              onSave={handleSave}
              advancedExpenses={advancedExpenses}
              scenario={currentScenario}
              onViewAmortization={handleViewAmortization}
              sharedScenariosFromClients={sharedScenariosFromClients}
            />
          )}
          {currentStep === 'amortization' && (
            <AmortizationPage
              analysis={amortizationData?.analysis || analysis}
              currentProperty={amortizationData?.property || currentProperty}
              scenario={amortizationData?.scenario}
              scenarioAnalysis={amortizationData?.scenarioAnalysis}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 'about' && (
            <AboutPage onBack={() => setCurrentStep('home')} />
          )}
          {currentStep === 'clients' && (
            <ClientsPage onBack={() => setCurrentStep('home')} />
          )}
          {currentStep === 'marketParams' && (
            <MarketParamsPage onBack={() => setCurrentStep('home')} />
          )}
        </>
      )}
        </>
      )}
    </div>
  );
};

export default RentalPropertyAnalyzer;
