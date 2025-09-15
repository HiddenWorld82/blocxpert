import calculateRentability from './calculateRentability.js';
import parseLocaleNumber from './parseLocaleNumber.js';
import { getAphMaxLtvRatio } from './cmhc.js';

export default function calculateFutureScenario(
  scenario,
  property,
  parentScenario,
  advancedExpenses = false
) {
  if (!property) {
    return { analysisProperty: null, analysis: null, equityWithdrawal: 0 };
  }

  const revenuePct =
    (parseFloat(parseLocaleNumber(scenario.revenueGrowthPct)) || 0) / 100;
  const expensePct =
    (parseFloat(parseLocaleNumber(scenario.expenseGrowthPct)) || 0) / 100;
  const appreciationPct =
    (parseFloat(parseLocaleNumber(scenario.valueAppreciationPct)) || 0) / 100;
  const years = parseFloat(parseLocaleNumber(scenario.refinanceYears)) || 0;
  const revenueFactor = Math.pow(1 + revenuePct, Math.max(years, 0));
  const expenseFactor = Math.pow(1 + expensePct, Math.max(years, 0));
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const marketValue =
    parseFloat(parseLocaleNumber(scenario.marketValue)) ||
    purchasePrice * Math.pow(1 + appreciationPct, Math.max(years, 0));

  const revenueFields = [
    'annualRent',
    'parkingRevenue',
    'internetRevenue',
    'storageRevenue',
    'otherRevenue',
  ];
  const expenseFields = [
    'municipalTaxes',
    'schoolTaxes',
    'insurance',
    'electricityHeating',
    'maintenance',
    'concierge',
    'operatingExpenses',
    'otherExpenses',
    'heating',
    'electricity',
    'landscaping',
    'snowRemoval',
    'extermination',
    'fireInspection',
    'advertising',
    'legal',
    'accounting',
    'elevator',
    'cableInternet',
    'appliances',
    'garbage',
    'washerDryer',
    'hotWater',
  ];

  const scaled = {};
  revenueFields.forEach((field) => {
    const value = parseFloat(property[field]);
    if (!isNaN(value)) {
      scaled[field] = value * revenueFactor;
    }
  });
  expenseFields.forEach((field) => {
    const value = parseFloat(property[field]);
    if (!isNaN(value)) {
      scaled[field] = value * expenseFactor;
    }
  });

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
  ];
  const propertyWithoutCosts = { ...property };
  acquisitionCostFields.forEach((field) => {
    delete propertyWithoutCosts[field];
  });

  const analysisProperty = {
    ...propertyWithoutCosts,
    ...scaled,
    purchasePrice: marketValue,
  };

  const combinedProperty = {
    ...analysisProperty,
    ...scenario.financing,
    ...scenario.financingFees,
    ignoreLTV: true,
  };

  const parentProperty = parentScenario
    ? { ...property, ...parentScenario.financing, ...parentScenario.acquisitionCosts }
    : property;

  const parentAnalysis = parentProperty
    ? calculateRentability(parentProperty, advancedExpenses)
    : null;

  let existingLoanBalance = 0;
  if (parentAnalysis) {
    const principal = parentAnalysis.maxLoanAmount || 0;
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

  const analysis = calculateRentability(combinedProperty, advancedExpenses, {
    initialLoanAmount: ['cmhc', 'cmhc_aph'].includes(parentProperty?.financingType)
      ? existingLoanBalance
      : 0,
  });

  const totalFees = Object.values(scenario.financingFees || {}).reduce(
    (sum, val) => sum + Number(parseLocaleNumber(val) || 0),
    0,
  );

  const equityWithdrawal =
    analysis.maxLoanAmount - existingLoanBalance - totalFees;

  return { analysisProperty, analysis, equityWithdrawal };
}
