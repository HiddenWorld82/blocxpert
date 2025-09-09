// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState, useEffect } from 'react';
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

const RentalPropertyAnalyzer = () => {
  const { currentUser, properties, propertiesLoading } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState('home');
  const [currentProperty, setCurrentProperty] = useState(defaultProperty);
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [amortizationData, setAmortizationData] = useState(null);
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
    const importShared = async () => {
      const params = new URLSearchParams(window.location.search);
      const shared = params.get('share');
      if (shared && currentUser) {
        try {
          const data = JSON.parse(decodeURIComponent(atob(shared)));
          await importSharedProperty(data, currentUser.uid);
          alert(t('property.import.success'));
        } catch (e) {
          console.error("Import error", e);
        } finally {
          params.delete('share');
          const newUrl = `${window.location.pathname}${
            params.toString() ? `?${params.toString()}` : ''
          }`;
          window.history.replaceState({}, '', newUrl);
        }
      }
    };
    importShared();
  }, [currentUser]);

  const handleShare = async (propertyId) => {
    try {
      const data = await exportProperty(propertyId);
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      const link = `${window.location.origin}/?share=${encoded}`;
      await navigator.clipboard.writeText(link);
      alert(t('share.link.copied'));
    } catch (e) {
      console.error(t('share.error'), e);
    }
  };

  const handleSave = async () => {
    const fieldsToSave = [
      'address',
      'city',
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
    const propertyWithAnalysis = {
      ...propertyData,
      advancedExpenses,
      ...analysis,
      uid: currentUser.uid,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {propertiesLoading ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-gray-700">{t('loading')}</span>
        </div>
      ) : (
        <>
          {currentStep === 'home' && (
            <HomeScreen
              properties={properties}
              onNew={resetProperty}
              onSelect={(property) => {
                setCurrentProperty(property);
                setAdvancedExpenses(property.advancedExpenses || false);
                setCurrentStep('dashboard');
              }}
              onDelete={deleteProperty}
              onShare={handleShare}
              onAbout={() => setCurrentStep('about')}
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
        </>
      )}
    </div>
  );
};

export default RentalPropertyAnalyzer;
