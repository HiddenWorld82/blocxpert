// hooks/useScenarios.js
import { useEffect, useState } from 'react';
import { createScenario, duplicateScenario, getScenarios } from '../services/scenarioService';

const useScenarios = (buildingId) => {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    let unsubscribe;
    if (buildingId) {
      unsubscribe = getScenarios(buildingId, setScenarios);
    } else {
      setScenarios([]);
    }
    return () => unsubscribe && unsubscribe();
  }, [buildingId]);

  const addScenario = async (scenario) => {
    if (!buildingId) return null;
    return createScenario(buildingId, scenario);
  };

  const cloneScenario = async (scenarioId, overrides = {}) => {
    if (!buildingId) return null;
    return duplicateScenario(buildingId, scenarioId, overrides);
  };

  return { scenarios, addScenario, cloneScenario };
};

export default useScenarios;
