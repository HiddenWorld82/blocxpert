import calculateRentability from './calculateRentability.js';
import parseLocaleNumber from './parseLocaleNumber.js';

export default function calculateRenewScenario(
  scenario,
  property,
  parentScenario,
  advancedExpenses = false
) {
  if (!property) {
    return { analysisProperty: null, combinedFinancing: null, analysis: null };
  }

  const parentProperty = parentScenario
    ? { ...property, ...parentScenario.financing, ...parentScenario.acquisitionCosts }
    : property;

  const parentAnalysis = parentProperty
    ? calculateRentability(parentProperty, advancedExpenses)
    : null;

  let existingLoanBalance = 0;
  let existingLoanPrincipal = 0;
  if (parentAnalysis) {
    const principal = parentAnalysis.maxLoanAmount || 0;
    const totalLoanAmount = parentAnalysis.totalLoanAmount || principal;
    const mortgageRate = (parseFloat(parentProperty?.mortgageRate) || 0) / 100;
    const monthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
    const amortizationYears = parseInt(parentProperty?.amortization) || 25;
    const totalPayments = amortizationYears * 12;
    const paymentsMade = Math.min(
      (parseInt(parentProperty?.term) || 0) * 12,
      totalPayments,
    );
    if (monthlyRate <= 0) {
      existingLoanBalance = totalLoanAmount;
      existingLoanPrincipal = principal;
    } else {
      const balance =
        totalLoanAmount *
        (Math.pow(1 + monthlyRate, totalPayments) -
          Math.pow(1 + monthlyRate, paymentsMade)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      const factor = balance / totalLoanAmount;
      existingLoanBalance = balance;
      existingLoanPrincipal = principal * factor;
    }
  }

  const remainingAmortization = (() => {
    const amort = parseInt(parentProperty?.amortization) || 25;
    const term = parseInt(parentProperty?.term) || 0;
    return Math.max(amort - term, 0);
  })();

  const revenuePct =
    (parseFloat(parseLocaleNumber(scenario.revenueGrowthPct)) || 0) / 100;
  const expensePct =
    (parseFloat(parseLocaleNumber(scenario.expenseGrowthPct)) || 0) / 100;
  const appreciationPct =
    (parseFloat(parseLocaleNumber(scenario.valueAppreciationPct)) || 0) / 100;
  const termYears = parseInt(parentScenario?.financing?.term) || 0;
  const revenueFactor = Math.pow(1 + revenuePct, Math.max(termYears, 0));
  const expenseFactor = Math.pow(1 + expensePct, Math.max(termYears, 0));
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const marketValue = purchasePrice * Math.pow(1 + appreciationPct, Math.max(termYears, 0));

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

  const parentFin = parentScenario?.financing || {};
  const mortgageRate =
    scenario.financing.mortgageRate || parentFin.mortgageRate || '';
  const combinedFinancing = {
    ...parentFin,
    ...scenario.financing,
    mortgageRate,
    qualificationRate: mortgageRate,
    amortization: remainingAmortization.toString(),
  };

  const combinedProperty = {
    ...analysisProperty,
    ...combinedFinancing,
  };

  const baseAnalysis = calculateRentability(combinedProperty, advancedExpenses, {
    initialLoanAmount: ['cmhc', 'cmhc_aph'].includes(parentProperty?.financingType)
      ? existingLoanBalance
      : 0,
  });

  const mortgageRateNum = (parseFloat(combinedFinancing.mortgageRate) || 0) / 100;
  const monthlyRate = Math.pow(1 + mortgageRateNum / 2, 1 / 6) - 1;
  const totalPayments = (parseInt(combinedFinancing.amortization) || 0) * 12;
  const totalLoanAmount = existingLoanBalance;
  const monthlyPayment =
    totalLoanAmount > 0 && monthlyRate > 0
      ? (totalLoanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1)
      : 0;
  const annualDebtService = monthlyPayment * 12;
  const cashFlow = baseAnalysis.effectiveNetIncome - annualDebtService;
  const purchasePriceNew = parseFloat(analysisProperty?.purchasePrice) || 0;
  const downPayment = purchasePriceNew - existingLoanBalance;
  const totalInvestment = downPayment + baseAnalysis.acquisitionCosts;
  let principalPaidYear1 = 0;
  if (monthlyPayment > 0) {
    let balance = totalLoanAmount;
    for (let i = 0; i < 12; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      principalPaidYear1 += principal;
      balance -= principal;
    }
  }
  const loanPaydownReturn =
    totalInvestment > 0 ? (principalPaidYear1 / totalInvestment) * 100 : 0;
  const appreciationRate =
    (parseFloat(parseLocaleNumber(scenario.valueAppreciationPct)) || 0) / 100;
  const appreciationReturn =
    totalInvestment > 0
      ? ((purchasePriceNew * appreciationRate) / totalInvestment) * 100
      : 0;
  const cashOnCashReturn =
    totalInvestment > 0 ? (cashFlow / totalInvestment) * 100 : 0;
  const totalReturn =
    cashOnCashReturn + loanPaydownReturn + appreciationReturn;
  const valueGeneratedYear1 =
    cashFlow + principalPaidYear1 + purchasePriceNew * appreciationRate;
  const loanValueRatio =
    purchasePriceNew > 0 ? (totalLoanAmount / purchasePriceNew) * 100 : 0;

  const analysis = {
    ...baseAnalysis,
    maxLoanAmount: existingLoanPrincipal,
    totalLoanAmount,
    cmhcPremium: 0,
    monthlyPayment,
    annualDebtService,
    cashFlow,
    downPayment,
    totalInvestment,
    loanValueRatio,
    cashOnCashReturn,
    loanPaydownReturn,
    appreciationReturn,
    totalReturn,
    valueGeneratedYear1,
  };

  return { analysisProperty, combinedFinancing, analysis };
}
