// Nouveau fichier principal : RentalPropertyAnalyzer.jsx
import React, { useEffect, useState } from 'react';
import ScenarioEditor from './components/ScenarioEditor';
import PropertyReport from './components/PropertyReport';
import HomeScreen from './components/HomeScreen';
import AmortizationPage from './components/AmortizationPage';
import useRentabilityCalculator from './hooks/useRentabilityCalculator';
import defaultProperty from './defaults/defaultProperty';
import { useAuth } from './contexts/AuthContext';
import { createBuilding } from './services/buildingService';
import {
  createScenario,
  updateScenario,
  getScenarios,
} from './services/scenarioService';
import Header from './components/Header';

const RentalPropertyAnalyzer = () => {
  const { currentUser, buildings, buildingsLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState('home');
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(defaultProperty);
  const [scenarios, setScenarios] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
  const [lockedFields, setLockedFields] = useState({
    //maintenance: false,
    //concierge: false,
    debtCoverage: true,
    welcomeTax: true
  });

  const analysis = useRentabilityCalculator(
    currentScenario,
    advancedExpenses,
    lockedFields,
    setCurrentScenario,
  );

  useEffect(() => {
    let unsubscribe;
    if (currentBuilding?.id) {
      unsubscribe = getScenarios(currentBuilding.id, (scs) => {
        setScenarios(scs);
        if (scs.length > 0) {
          setCurrentScenario(scs[0]);
        }
      });
    } else {
      setScenarios([]);
    }
    return unsubscribe;
  }, [currentBuilding]);

  const handleSave = async () => {
    const scenarioWithAnalysis = {
      ...currentScenario,
      ...analysis,
      uid: currentUser.uid,
    };

    let buildingId = currentBuilding?.id;

    if (!buildingId) {
      buildingId = await createBuilding({
        address: currentScenario.address,
        uid: currentUser.uid,
      });
      setCurrentBuilding({ id: buildingId, address: currentScenario.address, uid: currentUser.uid });
    }

    if (currentScenario.id) {
      await updateScenario(buildingId, currentScenario.id, scenarioWithAnalysis);
    } else {
      const newId = await createScenario(buildingId, scenarioWithAnalysis);
      setCurrentScenario({ id: newId, ...scenarioWithAnalysis });
    }
    setCurrentStep('home');
    setComparisonMode(false);
  };

  const resetScenario = () => {
    setCurrentBuilding(null);
    setCurrentScenario(defaultProperty);
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {comparisonMode && <div />}
      <div className="hidden">{scenarios.length}</div>
      {buildingsLoading ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-gray-700">Chargement...</span>
        </div>
      ) : (
        <>
          {currentStep === 'home' && (
            <HomeScreen
              properties={buildings}
              onNew={resetScenario}
              onSelect={(building) => {
                setCurrentBuilding(building);
                setCurrentScenario(building);
                setCurrentStep('report');
              }}
            />
          )}
          {currentStep === 'form' && (
            <ScenarioEditor
              currentScenario={currentScenario}
              setCurrentScenario={setCurrentScenario}
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
              currentProperty={currentScenario}
              setCurrentStep={setCurrentStep}
              analysis={analysis}
              onSave={handleSave}
              advancedExpenses={advancedExpenses}
            />
          )}
          {currentStep === 'amortization' && (
            <AmortizationPage
              analysis={analysis}
              currentProperty={currentScenario}
              setCurrentStep={setCurrentStep}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RentalPropertyAnalyzer;
