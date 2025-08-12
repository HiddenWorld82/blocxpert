// hooks/useScenarios.js
import { useEffect, useState } from 'react';
import {
  createScenario,
  duplicateScenario,
  getScenarios,
  updateScenario as updateScenarioService,
  deleteScenario as deleteScenarioService
} from '../services/scenarioService';

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

  const updateScenario = async (scenarioId, data) => {
    if (!buildingId || !scenarioId) return;
    await updateScenarioService(buildingId, scenarioId, data);
  };

  const deleteScenario = async (scenarioId) => {
    if (!buildingId || !scenarioId) return;
    await deleteScenarioService(buildingId, scenarioId);
  };

  return { scenarios, addScenario, updateScenario, deleteScenario, cloneScenario };
};

export default useScenarios;
