// hooks/useComparison.js
import { useState } from 'react';

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

  const selectedScenarios = scenarios.filter((s) => selected.includes(s.id));

  const exportPDF = () => {
    window.print();
  };

  return {
    selected,
    selectedScenarios,
    toggleScenario,
    exportPDF,
  };
};

export default useComparison;

