// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import AmortizationPage from './components/AmortizationPage';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import defaultProperty from './defaults/defaultProperty';
import { useAuth } from './contexts/AuthContext';
import {
  getProperties,
  saveProperty,
  updateProperty,
} from './services/dataService';

const RentalPropertyAnalyzer = () => {
  const { currentUser, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState('home');
  const [properties, setProperties] = useState([]);
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

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = getProperties(currentUser.uid, setProperties);
    return unsubscribe;
  }, [currentUser]);

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
      <div className="p-4 flex justify-end items-center gap-2">
        {currentUser ? (
          <>
            <span className="text-sm text-gray-700">{currentUser.email}</span>
            <button
              onClick={logout}
              className="text-sm text-blue-600 hover:underline"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-700">Non connecté</span>
        )}
      </div>
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
    </div>
  );
};

export default RentalPropertyAnalyzer;
