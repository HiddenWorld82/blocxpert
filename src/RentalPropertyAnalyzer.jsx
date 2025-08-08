// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useState, /*useEffect*/ } from 'react';
import { Home, Plus } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import defaultProperty from './defaults/defaultProperty';

const RentalPropertyAnalyzer = () => {
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

  const analysis = useRentabilityCalculator(currentProperty, advancedExpenses, lockedFields, setCurrentProperty);

  const handleSave = () => {
    const newProperties = [...properties];
    const existingIndex = newProperties.findIndex(p => p.address === currentProperty.address);
    if (existingIndex >= 0) {
      newProperties[existingIndex] = currentProperty;
    } else {
      newProperties.push(currentProperty);
    }
    setProperties(newProperties);
    setCurrentStep('home');
  };

  const resetProperty = () => {
    setCurrentProperty(defaultProperty);
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        />
      )}
    </div>
  );
};

export default RentalPropertyAnalyzer;