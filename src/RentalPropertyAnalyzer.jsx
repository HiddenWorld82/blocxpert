// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyForm from './components/PropertyForm';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import AmortizationPage from './components/AmortizationPage';
import BuildingDashboard from './components/BuildingDashboard';
import ProjectDocumentsPage from './components/projectDocuments/ProjectDocumentsPage';
import FinancementDossierPage from './components/financementDossier/FinancementDossierPage';
import FinancingScenarioForm from './components/FinancingScenarioForm';
import AboutPage from './components/AboutPage';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import defaultProperty from './defaults/defaultProperty';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import {
  saveProperty,
  updateProperty,
  deletePropertyAndScenarios,
  exportProperty,
  importSharedProperty,
} from './services/dataService';
import { deleteFinancementDossiersByProperty } from './services/financementDossierService';
import { deleteGeneralDossier } from './services/generalDossierService';
import DeletePropertyConfirmModal from './components/DeletePropertyConfirmModal';
import Header from './components/Header';
import OnboardingModal from './components/onboarding/OnboardingModal';
import ClientsPage from './components/clients/ClientsPage';
import ChecklistsPage from './components/checklists/ChecklistsPage';
import MarketParamsPage from './components/marketParams/MarketParamsPage';
import ShareModal from './components/share/ShareModal';
import ShareWithBrokerModal from './components/share/ShareWithBrokerModal';
import ShareMethodChoiceModal from './components/share/ShareMethodChoiceModal';
import BrokerPickerModal from './components/share/BrokerPickerModal';
import SharedPropertyView from './components/shared/SharedPropertyView';
import { getShare, markSharedWithMeSeen, removeSharedWithMe, getSharesByProperty, getShareScenariosOnce, cleanupPropertyShares, getPropertyShareRecipientCount } from './services/shareService';
import { getClients, getInviteByToken, updateClient } from './services/clientsService';
import { setUserProfile } from './services/userProfileService';
import { addBrokerLink } from './services/brokerLinksService';
import { isBrokerPersona } from './constants/personas';

const RentalPropertyAnalyzer = () => {
  const { currentUser, userProfile, properties, propertiesLoading, sharedWithMe, linkedBrokers, refreshSharedWithMe, refreshUserProfile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('home');
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    if (location.state?.shareAdded) {
      setShowShareAddedBanner(true);
      setShareStatsVersion((v) => v + 1);
      navigate('/', { replace: true, state: {} });
      const t = setTimeout(() => setShowShareAddedBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [location.state?.shareAdded, navigate]);

  useEffect(() => {
    if (location.state?.invitationAccepted) {
      setInvitationAcceptedMessage(true);
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state?.invitationAccepted, navigate]);
  const [currentProperty, setCurrentProperty] = useState(defaultProperty);
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [amortizationData, setAmortizationData] = useState(null);
  const [clients, setClients] = useState([]);
  const [shareModalPropertyId, setShareModalPropertyId] = useState(null);
  const [shareWithBrokerPropertyId, setShareWithBrokerPropertyId] = useState(null);
  const [selectedBrokerForShare, setSelectedBrokerForShare] = useState(null);
  const [shareBrokerPickerPropertyId, setShareBrokerPickerPropertyId] = useState(null);
  const [shareMethodChoicePropertyId, setShareMethodChoicePropertyId] = useState(null);
  const [shareStatsVersion, setShareStatsVersion] = useState(0);
  const [shareStats, setShareStats] = useState({});
  const [hasSharesMap, setHasSharesMap] = useState({});
  const [invitationAcceptedMessage, setInvitationAcceptedMessage] = useState(null);
  const [showShareAddedBanner, setShowShareAddedBanner] = useState(false);
  const [viewingShareData, setViewingShareData] = useState(null);
  const [sharedScenariosFromClients, setSharedScenariosFromClients] = useState([]);
  const [selectedFinancementDossier, setSelectedFinancementDossier] = useState(null);
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
    if (isBrokerPersona(userProfile?.persona) && currentUser?.uid) {
      const unsub = getClients(currentUser.uid, setClients);
      return () => {
        const u = unsub;
        queueMicrotask(() => u?.());
      };
    }
  }, [userProfile?.persona, currentUser?.uid]);

  // Migration : si le profil a encore brokerUid/brokerClientId mais brokerLinks est vide, ajouter le lien
  useEffect(() => {
    if (!currentUser?.uid || !userProfile?.brokerUid || !userProfile?.brokerClientId) return;
    if (linkedBrokers.length > 0) return;
    addBrokerLink(
      currentUser.uid,
      userProfile.brokerUid,
      userProfile.brokerClientId,
      userProfile.brokerDisplayName || ''
    ).catch((e) => console.warn('brokerLinks migration failed', e?.message));
  }, [currentUser?.uid, userProfile?.brokerUid, userProfile?.brokerClientId, userProfile?.brokerDisplayName, linkedBrokers.length]);

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
        await addBrokerLink(currentUser.uid, inviteData.brokerUid, inviteData.clientId, '');
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
    if (isBrokerPersona(userProfile?.persona)) {
      const property = properties?.find((p) => p.id === propertyId);
      if (property?.fromClient) return; // Ne pas permettre au courtier de partager un immeuble partagé par un client (données confidentielles)
      setShareModalPropertyId(propertyId);
      return;
    }
    // Investisseur avec au moins un courtier lié : proposer partage avec courtier ou par courriel.
    // On s'appuie sur linkedBrokers (sous-collection brokerLinks) pour éviter d'afficher
    // "Partager avec mon courtier" si l'investisseur n'est plus rattaché à un courtier.
    if (linkedBrokers?.length > 0) {
      setShareMethodChoicePropertyId(propertyId);
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
      ...((userProfile?.brokerClientId || linkedBrokers?.[0]?.clientId) && !isClientProperty && {
        brokerUid: userProfile?.brokerUid || linkedBrokers?.[0]?.brokerUid,
        brokerClientId: userProfile?.brokerClientId || linkedBrokers?.[0]?.clientId,
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

  const isCourtierHypo = isBrokerPersona(userProfile?.persona);

  const handleDeleteProperty = async (property) => {
    const propertyId = property?.id ?? property;
    const ownerUid = typeof property === 'object' && property?.uid != null ? property.uid : currentUser?.uid;
    if (!propertyId || !ownerUid) return;
    try {
      await cleanupPropertyShares(ownerUid, propertyId);
      await deleteFinancementDossiersByProperty(propertyId, ownerUid);
      await deleteGeneralDossier(propertyId);
      await deletePropertyAndScenarios(propertyId);
      setPropertyToDelete(null);
    } catch (e) {
      console.error(e);
      alert((t('share.error') || 'Erreur') + ': ' + (e?.message || e));
    }
  };

  // When user views home, refresh "Partagés avec moi" for all personas so entries whose share was deleted disappear
  useEffect(() => {
    if (currentStep === 'home' && currentUser?.uid && refreshSharedWithMe) {
      refreshSharedWithMe();
    }
  }, [currentStep, currentUser?.uid, refreshSharedWithMe]);

  // Share stats for home screen (lifted here so state updates reliably trigger re-render of HomeScreen)
  const propertyIdsKey = (properties || []).map((p) => p.id).filter(Boolean).join(',');
  useEffect(() => {
    if (!currentUser?.uid || !properties?.length) {
      setShareStats({});
      setHasSharesMap({});
      return;
    }
    const ownedIds = properties.filter((p) => p.uid === currentUser.uid).map((p) => p.id).filter(Boolean);
    if (!ownedIds.length) {
      setShareStats({});
      setHasSharesMap({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      const nextCount = {};
      const nextHas = {};
      await Promise.all(
        ownedIds.map(async (id) => {
          if (cancelled) return;
          const shares = await getSharesByProperty(currentUser.uid, id).catch(() => []);
          const count = await getPropertyShareRecipientCount(currentUser.uid, id).catch(() => 0);
          if (!cancelled) {
            nextHas[id] = shares.length > 0;
            nextCount[id] = count;
          }
        })
      );
      if (!cancelled) {
        setShareStats(nextCount);
        setHasSharesMap(nextHas);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser?.uid, propertyIdsKey, shareStatsVersion, currentStep]);

  // Refetch share stats when user returns to the app tab (e.g. recipient removed share in another tab)
  useEffect(() => {
    const onFocus = () => setShareStatsVersion((v) => v + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

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
      {shareMethodChoicePropertyId && (
        <ShareMethodChoiceModal
          propertyId={shareMethodChoicePropertyId}
          onClose={() => setShareMethodChoicePropertyId(null)}
          onChooseBroker={(id) => {
            setShareMethodChoicePropertyId(null);
            if (linkedBrokers.length === 1) {
              setSelectedBrokerForShare(linkedBrokers[0]);
              setShareWithBrokerPropertyId(id);
            } else {
              setShareBrokerPickerPropertyId(id);
            }
          }}
          onChooseEmail={(id) => {
            setShareMethodChoicePropertyId(null);
            setShareModalPropertyId(id);
          }}
        />
      )}
      {shareBrokerPickerPropertyId && linkedBrokers.length > 1 && (
        <BrokerPickerModal
          brokers={linkedBrokers}
          alreadySharedBrokerUids={
            properties?.find((p) => p.id === shareBrokerPickerPropertyId)?.sharedWithBrokerUids || []
          }
          onClose={() => setShareBrokerPickerPropertyId(null)}
          onSelect={(broker) => {
            setSelectedBrokerForShare(broker);
            setShareWithBrokerPropertyId(shareBrokerPickerPropertyId);
            setShareBrokerPickerPropertyId(null);
          }}
        />
      )}
      {shareModalPropertyId && (
        <ShareModal
          propertyId={shareModalPropertyId}
          onClose={() => {
            setShareModalPropertyId(null);
            setTimeout(() => setShareStatsVersion((v) => v + 1), 600);
          }}
          onShared={() => {
            setShareStatsVersion((v) => v + 1);
            // Plusieurs rafraîchissements décalés : Firestore peut mettre un moment à propager sharedWithMe
            setTimeout(() => setShareStatsVersion((v) => v + 1), 800);
            setTimeout(() => setShareStatsVersion((v) => v + 1), 2000);
            setTimeout(() => setShareStatsVersion((v) => v + 1), 4000);
          }}
        />
      )}
      {shareWithBrokerPropertyId && (
        <ShareWithBrokerModal
          propertyId={shareWithBrokerPropertyId}
          selectedBroker={selectedBrokerForShare}
          alreadySharedWithThisBroker={
            (() => {
              const prop = properties?.find((p) => p.id === shareWithBrokerPropertyId);
              const broker = selectedBrokerForShare || linkedBrokers?.[0];
              return !!(prop?.sharedWithBrokerUids?.length && broker && prop.sharedWithBrokerUids.includes(broker.brokerUid));
            })()
          }
          onClose={() => {
            setShareWithBrokerPropertyId(null);
            setSelectedBrokerForShare(null);
          }}
          onShared={(id) => {
            const broker = selectedBrokerForShare || linkedBrokers?.[0];
            setShareWithBrokerPropertyId(null);
            setSelectedBrokerForShare(null);
            setCurrentProperty((prev) => (prev?.id === id && broker ? { ...prev, brokerUid: broker.brokerUid, clientId: broker.clientId } : prev));
          }}
        />
      )}
      <Header
        onNavigateToHome={() => setCurrentStep('home')}
        onNavigateToClients={isCourtierHypo ? () => setCurrentStep('clients') : undefined}
        onNavigateToChecklists={isCourtierHypo ? () => setCurrentStep('checklists') : undefined}
        onNavigateToMarketParams={undefined}
      />
      {showShareAddedBanner && (
        <div className="bg-green-600 text-white text-center py-3 px-4 text-sm font-medium">
          {t('home.shareAddedBanner')}
        </div>
      )}
      {propertyToDelete && (
        <DeletePropertyConfirmModal
          property={propertyToDelete}
          onClose={() => setPropertyToDelete(null)}
          onConfirm={() => handleDeleteProperty(propertyToDelete)}
        />
      )}
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
              shareStats={shareStats}
              hasSharesMap={hasSharesMap}
              shareStatsVersion={shareStatsVersion}
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
              onDelete={(property) => setPropertyToDelete(property)}
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
              onOpenProjectDocuments={() => setCurrentStep('projectDocuments')}
              onOpenFinancementDossier={(dossier) => {
                setSelectedFinancementDossier(dossier);
                setCurrentStep('financementDossier');
              }}
              clients={clients}
              isCourtierHypo={isCourtierHypo}
              additionalScenariosFromShares={sharedScenariosFromClients}
            />
          )}
          {currentStep === 'projectDocuments' && (
            <ProjectDocumentsPage
              property={currentProperty}
              onBack={() => setCurrentStep('dashboard')}
            />
          )}
          {currentStep === 'financementDossier' && selectedFinancementDossier && currentProperty && (
            <FinancementDossierPage
              dossier={selectedFinancementDossier}
              property={currentProperty}
              onBack={() => { setSelectedFinancementDossier(null); setCurrentStep('dashboard'); }}
            />
          )}
          {currentStep === 'scenario' && (
            <FinancingScenarioForm
              propertyId={currentProperty.id}
              property={currentProperty}
              advancedExpenses={advancedExpenses}
              initialScenario={currentScenario || {}}
              creatorUid={currentUser?.uid}
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
          {currentStep === 'checklists' && (
            <ChecklistsPage onBack={() => setCurrentStep('home')} />
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
