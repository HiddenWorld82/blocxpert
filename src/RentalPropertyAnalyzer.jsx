// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import AmortizationPage from './components/AmortizationPage';
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
  const [lockedFields, setLockedFields] = useState({
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
    const propertyWithAnalysis = {
      ...currentProperty,
      ...analysis,
      uid: currentUser.uid,
    };
    if (currentProperty.id) {
      await updateProperty(currentProperty.id, propertyWithAnalysis);
    } else {
      await saveProperty(propertyWithAnalysis);
    }
    setCurrentStep('home');
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
                setCurrentStep('report');
              }}
            />
          )}
          {currentStep === 'form' && (
            <PropertyForm
              currentProperty={currentProperty}
              setCurrentProperty={setCurrentProperty}
              lockedFields={lockedFields}
              setLockedFields={setLockedFields}
              setCurrentStep={setCurrentStep}
              analysis={analysis}
              advancedExpenses={advancedExpenses}
              setAdvancedExpenses={setAdvancedExpenses}
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
