// hooks/useComparison.js
import { useMemo, useState } from 'react';
import { compareScenarios } from '../services/scenarioService';

const useComparison = (scenarios = [], initialSelected = []) => {
  const [selected, setSelected] = useState(initialSelected);

  const toggleScenario = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const selectedScenarios = useMemo(
    () => scenarios.filter((s) => selected.includes(s.id)),
    [scenarios, selected]
  );

  const metrics = useMemo(() => {
    if (selectedScenarios.length < 2) return {};
    const base = selectedScenarios[0];
    return selectedScenarios.slice(1).reduce((acc, scenario) => {
      acc[scenario.id] = compareScenarios(scenario, base);
      return acc;
    }, {});
  }, [selectedScenarios]);

  const exportPDF = () => {
    window.print();
  };

  return {
    selected,
    selectedScenarios,
    toggleScenario,
    metrics,
    exportPDF,
  };
};

export default useComparison;

