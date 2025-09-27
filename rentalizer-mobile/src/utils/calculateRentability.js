import { getAphMaxLtvRatio } from './cmhc';
import schlExpenses from '../defaults/schlExpenses';

const calculateRentability = (property, advancedExpenses, { initialLoanAmount = 0 } = {}) => {
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const numberOfUnits = parseInt(property.numberOfUnits) || 1;
  const province = property.province;
  const structureType = property.structureType || 'woodFrame';

  const grossRent = parseFloat(property.annualRent) || 0;
  const totalGrossRevenue =
    grossRent +
    (parseFloat(property.parkingRevenue) || 0) +
    (parseFloat(property.internetRevenue) || 0) +
    (parseFloat(property.storageRevenue) || 0) +
    (parseFloat(property.otherRevenue) || 0);

  const vacancyAmount = totalGrossRevenue * ((parseFloat(property.vacancyRate) || 0) / 100);
  const effectiveGrossRevenue = totalGrossRevenue - vacancyAmount;

  const provinceConfig = province ? schlExpenses[province] : null;
  let schlConfig;
  if (provinceConfig) {
    if (structureType === 'woodFrame') {
      schlConfig = provinceConfig.woodFrame[numberOfUnits <= 11 ? 'small' : 'large'];
    } else {
      schlConfig = provinceConfig.concrete.any;
    }
  }

  const otherCostRate = schlConfig?.otherCostRate || 0;
  const otherCostAmount = (effectiveGrossRevenue * otherCostRate) / 100;

  const rrRates = schlConfig?.replacementReserve || {};
  const replacementReserve =
    ((parseInt(property.numHeatPumps) || 0) * (rrRates.heatPump || 0)) +
    ((parseInt(property.numFridges) || 0) * (rrRates.appliance || 0)) +
    ((parseInt(property.numStoves) || 0) * (rrRates.appliance || 0)) +
    ((parseInt(property.numDishwashers) || 0) * (rrRates.appliance || 0)) +
    ((parseInt(property.numWashers) || 0) * (rrRates.appliance || 0)) +
    ((parseInt(property.numDryers) || 0) * (rrRates.appliance || 0)) +
    ((parseInt(property.numElevators) || 0) * (rrRates.elevator || 0) * 12);

  let operatingExpensesSCHL = 0;
  let operatingExpensesTotal = 0;

  if (advancedExpenses) {
    const baseExpenses =
      (parseFloat(property.municipalTaxes) || 0) +
      (parseFloat(property.schoolTaxes) || 0) +
      (parseFloat(property.heating) || 0) +
      (parseFloat(property.electricity) || 0) +
      (parseFloat(property.insurance) || 0) +
      numberOfUnits * (parseFloat(property.maintenance) || 0) +
      (effectiveGrossRevenue * (parseFloat(property.managementRate) || 0)) / 100 +
      numberOfUnits * (parseFloat(property.concierge) || 0);

    const actualOtherCosts =
      (parseFloat(property.landscaping) || 0) +
      (parseFloat(property.snowRemoval) || 0) +
      (parseFloat(property.extermination) || 0) +
      (parseFloat(property.fireInspection) || 0) +
      (parseFloat(property.advertising) || 0) +
      (parseFloat(property.legal) || 0) +
      (parseFloat(property.accounting) || 0);

    const totalOtherCosts =
      actualOtherCosts +
      (parseFloat(property.elevator) || 0) +
      (parseFloat(property.cableInternet) || 0) +
      (parseFloat(property.appliances) || 0) +
      (parseFloat(property.garbage) || 0) +
      (parseFloat(property.washerDryer) || 0) +
      (parseFloat(property.hotWater) || 0);

    const schlOtherCosts = Math.max(
      otherCostRate > 0 ? otherCostAmount : 0,
      totalOtherCosts,
      vacancyAmount
    );

    operatingExpensesSCHL =
      baseExpenses +
      schlOtherCosts +
      (parseFloat(property.otherExpenses) || 0) +
      replacementReserve;

    operatingExpensesTotal =
      baseExpenses +
      totalOtherCosts +
      (parseFloat(property.otherExpenses) || 0) +
      replacementReserve;
  } else {
    operatingExpensesSCHL =
      (parseFloat(property.municipalTaxes) || 0) +
      (parseFloat(property.schoolTaxes) || 0) +
      (parseFloat(property.insurance) || 0) +
      numberOfUnits * (parseFloat(property.maintenance) || 0) +
      (effectiveGrossRevenue * (parseFloat(property.managementRate) || 0)) / 100 +
      numberOfUnits * (parseFloat(property.concierge) || 0) +
      (parseFloat(property.electricityHeating) || 0) +
      (parseFloat(property.otherExpenses) || 0) +
      replacementReserve;

    operatingExpensesTotal = operatingExpensesSCHL;
  }

  const schlTotalExpenses = advancedExpenses ? operatingExpensesSCHL : operatingExpensesSCHL + vacancyAmount;
  const totalExpenses = operatingExpensesTotal + vacancyAmount;
  const netOperatingIncome = totalGrossRevenue - schlTotalExpenses;
  const effectiveNetIncome = totalGrossRevenue - totalExpenses;

  const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
  const pricePerDoor = numberOfUnits > 0 ? purchasePrice / numberOfUnits : 0;

  const maintenanceTotal = numberOfUnits * (parseFloat(property.maintenance) || 0);
  const conciergeTotal = numberOfUnits * (parseFloat(property.concierge) || 0);
  const managementTotal = (effectiveGrossRevenue * (parseFloat(property.managementRate) || 0)) / 100;

  const baseExpenses =
    (parseFloat(property.municipalTaxes) || 0) +
    (parseFloat(property.schoolTaxes) || 0) +
    (parseFloat(property.insurance) || 0) +
    (parseFloat(property.electricityHeating) || 0) +
    maintenanceTotal +
    conciergeTotal +
    managementTotal +
    (parseFloat(property.otherExpenses) || 0);

  const totalOperatingExpenses = advancedExpenses ? operatingExpensesTotal : baseExpenses;

  const financingType = property.financingType || 'conventional';
  const mortgageRate = (parseFloat(property.mortgageRate) || 0) / 100;
  const amortizationYears = parseInt(property.amortization) || 25;
  const termYears = parseInt(property.term) || 5;
  const qualificationRate = (parseFloat(property.qualificationRate) || mortgageRate * 100) / 100;
  const debtCoverageRatio = parseFloat(property.debtCoverageRatio) || 1.15;

  const annualDebtService = (principal) => {
    const monthlyRate = mortgageRate / 12;
    const numberOfPayments = amortizationYears * 12;
    if (!monthlyRate) return principal / numberOfPayments;
    const factor = Math.pow(1 + monthlyRate, numberOfPayments);
    const payment = (principal * monthlyRate * factor) / (factor - 1);
    return payment * 12;
  };

  const maxLoanByDcr = debtCoverageRatio > 0 ? (effectiveNetIncome / debtCoverageRatio) : 0;
  const maxLoanByLtv = purchasePrice * (financingType === 'cmhc_aph'
    ? getAphMaxLtvRatio(parseFloat(property.aphPoints) || 0)
    : financingType === 'cmhc'
    ? 0.85
    : financingType === 'private'
    ? 0.75
    : 0.8);

  const maxLoan = Math.min(maxLoanByDcr / qualificationRate, maxLoanByLtv || purchasePrice);
  const loanGranted = Math.min(maxLoan, purchasePrice);
  const downPayment = purchasePrice - loanGranted;
  const ltv = purchasePrice > 0 ? (loanGranted / purchasePrice) * 100 : 0;

  const debtService = annualDebtService(loanGranted);
  const cashFlow = effectiveNetIncome - debtService;
  const cashOnCash = downPayment > 0 ? (cashFlow / downPayment) * 100 : 0;

  const acquisitionCosts =
    (parseFloat(property.inspection) || 0) +
    (parseFloat(property.environmental1) || 0) +
    (parseFloat(property.environmental2) || 0) +
    (parseFloat(property.environmental3) || 0) +
    (parseFloat(property.otherTests) || 0) +
    (parseFloat(property.appraiser) || 0) +
    (parseFloat(property.expertises) || 0) +
    (parseFloat(property.notary) || 0) +
    (parseFloat(property.renovations) || 0) +
    (parseFloat(property.cmhcAnalysis) || 0) +
    (parseFloat(property.cmhcTax) || 0) +
    (parseFloat(property.welcomeTax) || 0);

  const totalInvestment = downPayment + acquisitionCosts;

  const appreciationRate = (parseFloat(property.appreciationRate) || 0) / 100;
  const rentIncreaseRate = (parseFloat(property.rentIncreaseRate) || 0) / 100;
  const expenseIncreaseRate = (parseFloat(property.expenseIncreaseRate) || 0) / 100;

  const estimateFutureValue = (years) => purchasePrice * Math.pow(1 + appreciationRate, years);
  const estimateRent = (years) => totalGrossRevenue * Math.pow(1 + rentIncreaseRate, years);
  const estimateExpenses = (years) => totalOperatingExpenses * Math.pow(1 + expenseIncreaseRate, years);

  const loanBalance = (principal, years) => {
    const monthlyRate = mortgageRate / 12;
    const months = years * 12;
    if (!monthlyRate) return Math.max(principal - (principal / (amortizationYears * 12)) * months, 0);
    const numberOfPayments = amortizationYears * 12;
    const factor = Math.pow(1 + monthlyRate, numberOfPayments);
    const payment = (principal * monthlyRate * factor) / (factor - 1);
    const balanceFactor = Math.pow(1 + monthlyRate, months);
    return principal * factor - (payment / monthlyRate) * (factor - balanceFactor);
  };

  const futureYears = [1, 5, 10];
  const futureReturns = futureYears.map((year) => {
    const futureValue = estimateFutureValue(year);
    const futureRent = estimateRent(year);
    const futureExpenses = estimateExpenses(year);
    const futureNoi = futureRent - futureExpenses;
    const futureDebtService = annualDebtService(loanGranted);
    const futureCashFlow = futureNoi - futureDebtService;
    const balance = loanBalance(loanGranted, year);
    const equity = futureValue - balance;
    const totalGain = equity - downPayment;
    const annualizedReturn = totalInvestment > 0 ? Math.pow(futureValue / purchasePrice, 1 / year) - 1 : 0;

    return {
      year,
      futureValue,
      futureCashFlow,
      equity,
      totalGain,
      annualizedReturn: annualizedReturn * 100
    };
  });

  return {
    totalGrossRevenue,
    vacancyAmount,
    effectiveGrossRevenue,
    schlTotalExpenses,
    totalExpenses,
    netOperatingIncome,
    effectiveNetIncome,
    capRate,
    pricePerDoor,
    totalOperatingExpenses,
    maintenanceTotal,
    conciergeTotal,
    managementTotal,
    financingType,
    mortgageRate: mortgageRate * 100,
    amortizationYears,
    termYears,
    qualificationRate: qualificationRate * 100,
    debtCoverageRatio,
    maxLoan,
    loanGranted,
    downPayment,
    ltv,
    debtService,
    cashFlow,
    cashOnCash,
    acquisitionCosts,
    totalInvestment,
    appreciationRate: appreciationRate * 100,
    rentIncreaseRate: rentIncreaseRate * 100,
    expenseIncreaseRate: expenseIncreaseRate * 100,
    futureReturns,
    initialLoanAmount
  };
};

export default calculateRentability;
