import { useEffect, useMemo, useState } from 'react';
import calculateWelcomeTax from '../utils/calculateWelcomeTax';

const useRentabilityCalculator = (
  property,
  advancedExpenses,
  lockedFields,
  setCurrentProperty
) => {
  const [analysis, setAnalysis] = useState({});
  const propertyKey = useMemo(() => JSON.stringify(property), [property]);
  const expensesKey = useMemo(() => JSON.stringify(advancedExpenses), [advancedExpenses]);

  useEffect(() => {
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const numberOfUnits = parseInt(property.numberOfUnits) || 1;

    if (lockedFields?.welcomeTax && purchasePrice > 0) {
      const welcomeTax = Math.round(calculateWelcomeTax(purchasePrice)).toString();
      if (property.welcomeTax !== welcomeTax) {
        setCurrentProperty?.((prev) => ({ ...prev, welcomeTax }));
      }
    }

    if (lockedFields?.debtCoverage) {
      let newRcd = '1.15';
      if (property.financingType === 'cmhc') {
        newRcd = numberOfUnits >= 7 ? '1.3' : '1.1';
      } else if (property.financingType === 'cmhc_aph') {
        newRcd = '1.1';
      }
      if (property.debtCoverageRatio !== newRcd) {
        setCurrentProperty?.((prev) => ({ ...prev, debtCoverageRatio: newRcd }));
      }
    }

    if (['cmhc', 'cmhc_aph'].includes(property.financingType) && numberOfUnits > 0) {
      const analysisAmount = (numberOfUnits * 150).toString();
      if (property.cmhcAnalysis !== analysisAmount) {
        setCurrentProperty?.((prev) => ({ ...prev, cmhcAnalysis: analysisAmount }));
      }
    } else if (property.cmhcAnalysis || property.cmhcTax) {
      setCurrentProperty?.((prev) => ({ ...prev, cmhcAnalysis: '', cmhcTax: '' }));
    }
  }, [property, lockedFields, setCurrentProperty]);

  useEffect(() => {
    let isMounted = true;
    const runAnalysis = async () => {
      const calculate = (await import('../utils/calculateRentability')).default;
      const result = calculate(property, advancedExpenses);
      if (isMounted) {
        setAnalysis((prev) => (JSON.stringify(prev) === JSON.stringify(result) ? prev : result));
      }
    };
    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [propertyKey, expensesKey]);

  return analysis;
};

export default useRentabilityCalculator;
