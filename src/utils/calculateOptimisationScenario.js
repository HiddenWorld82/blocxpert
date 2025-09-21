import calculateRentability from './calculateRentability.js';
import parseLocaleNumber from './parseLocaleNumber.js';
import defaultProperty from '../defaults/defaultProperty.js';
import { getAphMaxLtvRatio } from './cmhc.js';

const numericLikePattern = /^-?[\d\s.,$()%]+$/;

function mergeNumericValues(target, source, { removeEmpty = false } = {}) {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      if (!removeEmpty) {
        target[key] = value;
      }
      return;
    }

    if (typeof value === 'number') {
      target[key] = value;
      return;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        if (!removeEmpty) {
          target[key] = '';
        }
        return;
      }

      if (numericLikePattern.test(trimmed)) {
        const normalized = parseLocaleNumber(value).replace(/[()]/g, '');
        if (normalized === '') {
          if (!removeEmpty) {
            target[key] = '';
          }
          return;
        }

        const isNegative = trimmed.startsWith('(') && trimmed.endsWith(')');
        const numeric = Number(normalized);
        if (!Number.isNaN(numeric)) {
          target[key] = isNegative ? -numeric : numeric;
          return;
        }
      }

      target[key] = value;
      return;
    }

    target[key] = value;
  });

  return target;
}

export default function calculateOptimisationScenario(
  scenario,
  property,
  parentScenario,
  advancedExpenses = false
) {
  if (!property) {
    return { analysisProperty: null, analysis: null, equityWithdrawal: 0 };
  }

  const overrides = mergeNumericValues(
    {},
    { ...scenario.revenue, ...scenario.operatingExpenses },
    { removeEmpty: true },
  );
  const marketValue =
    parseFloat(parseLocaleNumber(scenario.marketValue)) || 0;

  const acquisitionCostFields = [
    'inspection',
    'environmental1',
    'environmental2',
    'environmental3',
    'otherFees',
    'appraiser',
    'notary',
    'renovations',
    'cmhcAnalysis',
    'cmhcTax',
    'welcomeTax',
    'expertises',
    'workCost',
  ];

  const propertyWithoutCosts = { ...property };
  acquisitionCostFields.forEach((field) => {
    delete propertyWithoutCosts[field];
  });

  const basePropertyValues = mergeNumericValues({}, propertyWithoutCosts);
  const parsedUnits = Number(parseLocaleNumber(property.numberOfUnits));
  const analysisProperty = {
    ...defaultProperty,
    ...basePropertyValues,
    numberOfUnits:
      overrides.numberOfUnits ??
      basePropertyValues.numberOfUnits ??
      (!Number.isNaN(parsedUnits) ? parsedUnits : property.numberOfUnits),
    purchasePrice: marketValue,
    ...overrides,
  };

  const financing = mergeNumericValues({}, scenario.financing, {
    removeEmpty: true,
  });
  const financingFees = mergeNumericValues({}, scenario.financingFees, {
    removeEmpty: true,
  });

  const combinedProperty = {
    ...analysisProperty,
    ...financing,
    ...financingFees,
    ignoreLTV: true,
  };

  const parentProperty = parentScenario
    ? { ...property, ...parentScenario.financing, ...parentScenario.acquisitionCosts }
    : property;

  const parentAnalysis = parentProperty
    ? calculateRentability(parentProperty, advancedExpenses)
    : null;

  let existingLoanBalance = 0;
  let initialLoanAmount = 0;
  if (parentAnalysis) {
    const principal = parentAnalysis.maxLoanAmount || 0;
    initialLoanAmount = principal;
    let premium = 0;
    if (['cmhc', 'cmhc_aph'].includes(parentProperty?.financingType)) {
      const purchasePrice = parseFloat(parentProperty?.purchasePrice) || 0;
      const ltvRatio = purchasePrice > 0 ? (principal / purchasePrice) * 100 : 0;
      const standardRates = [
        { ltv: 65, rate: 0.026 },
        { ltv: 70, rate: 0.0285 },
        { ltv: 75, rate: 0.0335 },
        { ltv: 80, rate: 0.0435 },
        { ltv: 85, rate: 0.0535 },
      ];
      const points = parseInt(parentProperty?.aphPoints) || 0;
      const effectiveLtv =
        parentProperty.financingType === 'cmhc_aph'
          ? Math.min(ltvRatio, getAphMaxLtvRatio(points) * 100)
          : ltvRatio;
      let premiumRate = 0;
      if (parentProperty.financingType === 'cmhc_aph' && effectiveLtv > 85) {
        premiumRate = effectiveLtv <= 90 ? 0.059 : 0.0615;
      } else {
        const bracket = standardRates.find((b) => effectiveLtv <= b.ltv);
        premiumRate = bracket?.rate || standardRates.at(-1).rate;
      }
      const amortizationYears = parseInt(parentProperty?.amortization) || 25;
      if (amortizationYears > 25) {
        premiumRate += ((amortizationYears - 25) / 5) * 0.0025;
      }
      if (parentProperty.financingType === 'cmhc_aph') {
        const rebate =
          points >= 100 ? 0.3 : points >= 70 ? 0.2 : points >= 50 ? 0.1 : 0;
        premiumRate *= 1 - rebate;
      }
      premium = principal * premiumRate;
    }
    const totalLoanAmount = principal + premium;
    const mortgageRate = (parseFloat(parentProperty?.mortgageRate) || 0) / 100;
    const monthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
    const amortizationYears = parseInt(parentProperty?.amortization) || 25;
    const totalPayments = amortizationYears * 12;
    const paymentsMade = Math.min(
      (parseFloat(parseLocaleNumber(scenario.refinanceYears)) || 0) * 12,
      totalPayments,
    );
    if (monthlyRate <= 0) {
      existingLoanBalance = totalLoanAmount;
    } else {
      existingLoanBalance =
        totalLoanAmount *
        (Math.pow(1 + monthlyRate, totalPayments) -
          Math.pow(1 + monthlyRate, paymentsMade)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }
  }

  const scenarioFinancingType = combinedProperty?.financingType;
  const analysis = calculateRentability(combinedProperty, advancedExpenses, {
    initialLoanAmount: ['cmhc', 'cmhc_aph'].includes(scenarioFinancingType)
      ? initialLoanAmount
      : 0,
  });

  const totalFees = Object.values(scenario.financingFees || {}).reduce(
    (sum, val) => sum + Number(parseLocaleNumber(val) || 0),
    0,
  );

  const equityWithdrawal =
    analysis.maxLoanAmount - existingLoanBalance - totalFees;

  let adjustedAnalysis = analysis;
  if (
    analysis &&
    typeof analysis.economicValue === 'number' &&
    typeof analysis.totalLoanAmount === 'number'
  ) {
    const trappedEquity = analysis.economicValue - analysis.totalLoanAmount;
    adjustedAnalysis = { ...analysis, downPayment: trappedEquity };
  }

  return { analysisProperty, analysis: adjustedAnalysis, equityWithdrawal };
}
