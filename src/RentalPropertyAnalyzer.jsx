// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import AmortizationPage from './components/AmortizationPage';
import BuildingDashboard from './components/BuildingDashboard';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import defaultProperty from './defaults/defaultProperty';
import { useAuth } from './contexts/AuthContext';
import { saveProperty, updateProperty } from './services/dataService';
import Header from './components/Header';

const RentalPropertyAnalyzer = () => {
  const { currentUser, properties, propertiesLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState('home');
  const [currentProperty, setCurrentProperty] = useState(defaultProperty);
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
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

  const handleSave = async () => {
    const fieldsToSave = [
      'address',
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
    ];
    const propertyData = fieldsToSave.reduce((acc, key) => ({
      ...acc,
      [key]: currentProperty[key],
    }), {});
    const propertyWithAnalysis = {
      ...propertyData,
      advancedExpenses,
      ...analysis,
      uid: currentUser.uid,
    };
    if (currentProperty.id) {
      await updateProperty(currentProperty.id, propertyWithAnalysis);
      setCurrentProperty({ ...currentProperty, ...propertyWithAnalysis });
    } else {
      const newId = await saveProperty(propertyWithAnalysis);
      setCurrentProperty({ ...propertyWithAnalysis, id: newId });
    }
    setCurrentStep('dashboard');
  };

  const resetProperty = () => {
    setCurrentProperty(defaultProperty);
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {propertiesLoading ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-gray-700">Chargement...</span>
        </div>
      ) : (
        <>
          {currentStep === 'home' && (
            <HomeScreen
              properties={properties}
              onNew={resetProperty}
              onSelect={(property) => {
                setCurrentProperty(property);
                setCurrentStep('dashboard');
              }}
            />
          )}
          {currentStep === 'form' && (
            <PropertyForm
              currentProperty={currentProperty}
              setCurrentProperty={setCurrentProperty}
              setCurrentStep={setCurrentStep}
              advancedExpenses={advancedExpenses}
              setAdvancedExpenses={setAdvancedExpenses}
            />
          )}
          {currentStep === 'dashboard' && (
            <BuildingDashboard
              property={currentProperty}
              onCreateScenario={() => setCurrentStep('form')}
            />
          )}
          {currentStep === 'report' && (
            <PropertyReport
              currentProperty={currentProperty}
              setCurrentStep={setCurrentStep}
              analysis={analysis}
              onSave={handleSave}
              advancedExpenses={advancedExpenses}
            />
          )}
          {currentStep === 'amortization' && (
            <AmortizationPage
              analysis={analysis}
              currentProperty={currentProperty}
              setCurrentStep={setCurrentStep}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RentalPropertyAnalyzer;
