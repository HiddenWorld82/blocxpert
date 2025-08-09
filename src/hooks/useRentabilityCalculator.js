// hooks/useRentabilityCalculator.js
import { useEffect, useState } from 'react';
import calculateWelcomeTax from '../utils/calculateWelcomeTax';

const useRentabilityCalculator = (property, advancedExpenses, lockedFields, setCurrentProperty) => {
  const [analysis, setAnalysis] = useState({});

  useEffect(() => {
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const numberOfUnits = parseInt(property.numberOfUnits) || 1;

    // Calcul taxe de bienvenue
    if (lockedFields.welcomeTax && purchasePrice > 0) {
      const welcomeTax = calculateWelcomeTax(purchasePrice);
      setCurrentProperty(prev => ({ ...prev, welcomeTax: Math.round(welcomeTax).toString() }));
    }

    // Calcul du RCD automatique
    if (lockedFields.debtCoverage) {
      let newRCD = '1.15';
      if (property.financingType === 'cmhc') {
        newRCD = numberOfUnits >= 7 ? '1.3' : '1.1';
      } else if (property.financingType === 'cmhc_aph') {
        newRCD = '1.1';
      }
      if (property.debtCoverageRatio !== newRCD) {
        setCurrentProperty(prev => ({ ...prev, debtCoverageRatio: newRCD }));
      }
    }

    // Frais analyse SCHL
    if (["cmhc", "cmhc_aph"].includes(property.financingType) && numberOfUnits > 0) {
      const analysisAmount = (numberOfUnits * 150).toString();
      if (property.cmhcAnalysis !== analysisAmount) {
        setCurrentProperty(prev => ({ ...prev, cmhcAnalysis: analysisAmount }));
      }
    } else if (property.cmhcAnalysis || property.cmhcTax) {
      setCurrentProperty(prev => ({ ...prev, cmhcAnalysis: '', cmhcTax: '' }));
    }
  }, [property, lockedFields, setCurrentProperty]);

  useEffect(() => {
    if (["cmhc", "cmhc_aph"].includes(property.financingType)) {
      const taxAmount = analysis.cmhcTax ? Math.round(analysis.cmhcTax).toString() : '';
      if (property.cmhcTax !== taxAmount) {
        setCurrentProperty(prev => ({ ...prev, cmhcTax: taxAmount }));
      }
    }
  }, [analysis.cmhcTax, property.financingType, property.cmhcTax, setCurrentProperty]);

  useEffect(() => {
    // importer la logique complète du calcul ici si tu le souhaites,
    // ou l'extraire dans un util séparé si elle est très longue.
    const runAnalysis = async () => {
      const calculate = (await import('../utils/calculateRentability')).default;
      const result = calculate(property, advancedExpenses);
      setAnalysis(result);
    };
    runAnalysis();
  }, [property, advancedExpenses]);

  return analysis;
};

export default useRentabilityCalculator;
