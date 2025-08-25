// utils/calculateRentability.js
import { getAphMaxLtvRatio } from "./cmhc.js";
import schlExpenses from "../defaults/schlExpenses.js";

const calculateRentability = (
  property,
  advancedExpenses,
  { initialLoanAmount = 0 } = {},
) => {
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const numberOfUnits = parseInt(property.numberOfUnits) || 1;
  const province = property.province;
  const structureType = property.structureType || "woodFrame";

  const grossRent = parseFloat(property.annualRent) || 0;
  const totalGrossRevenue = grossRent +
    (parseFloat(property.parkingRevenue) || 0) +
    (parseFloat(property.internetRevenue) || 0) +
    (parseFloat(property.storageRevenue) || 0) +
    (parseFloat(property.otherRevenue) || 0);

  /**const vacancyRate = advancedExpenses ? (parseFloat(property.vacancyRate) || 0) / 100 : 0;
  const vacancyAmount = advancedExpenses
    ? totalGrossRevenue * vacancyRate
    : (parseFloat(property.vacancyAmount) || 0);**/
  const vacancyAmount = totalGrossRevenue * ((parseFloat(property.vacancyRate) || 0) / 100);
  const effectiveGrossRevenue = totalGrossRevenue - vacancyAmount;

  const provinceConfig = province ? schlExpenses[province] : null;
  let schlConfig;
  if (provinceConfig) {
    if (structureType === "woodFrame") {
      schlConfig = provinceConfig.woodFrame[numberOfUnits <= 11 ? "small" : "large"];
    } else {
      schlConfig = provinceConfig.concrete.any;
    }
  }

  const otherCostRate = schlConfig?.otherCostRate || 0;
  const otherCostAmount = effectiveGrossRevenue * otherCostRate / 100;

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
      (numberOfUnits * (parseFloat(property.maintenance) || 0)) +
      (effectiveGrossRevenue * (parseFloat(property.managementRate) || 0) / 100) +
      (numberOfUnits * (parseFloat(property.concierge) || 0));

    const actualOtherCosts =
      (parseFloat(property.landscaping) || 0) +
      (parseFloat(property.snowRemoval) || 0) +
      (parseFloat(property.extermination) || 0) +
      (parseFloat(property.fireInspection) || 0) +
      (parseFloat(property.advertising) || 0) +
      (parseFloat(property.legal) || 0) +
      (parseFloat(property.accounting) || 0);

    const schlOtherCosts = otherCostRate > 0
      ? Math.max(otherCostAmount, actualOtherCosts)
      : actualOtherCosts;

    operatingExpensesSCHL = baseExpenses + schlOtherCosts +
      (parseFloat(property.otherExpenses) || 0) +
      replacementReserve;

    const totalOtherCosts = actualOtherCosts +
      (parseFloat(property.elevator) || 0) +
      (parseFloat(property.cableInternet) || 0) +
      (parseFloat(property.appliances) || 0) +
      (parseFloat(property.garbage) || 0) +
      (parseFloat(property.washerDryer) || 0) +
      (parseFloat(property.hotWater) || 0);

    operatingExpensesTotal = baseExpenses + totalOtherCosts +
      (parseFloat(property.otherExpenses) || 0) +
      replacementReserve;
  } else {
    operatingExpensesSCHL =
      (parseFloat(property.municipalTaxes) || 0) +
      (parseFloat(property.schoolTaxes) || 0) +
      (parseFloat(property.insurance) || 0) +
      (numberOfUnits * (parseFloat(property.maintenance) || 0)) +
      (effectiveGrossRevenue * (parseFloat(property.managementRate) || 0) / 100) +
      (numberOfUnits * (parseFloat(property.concierge) || 0)) +
      (parseFloat(property.electricityHeating) || 0) +
      (parseFloat(property.otherExpenses) || 0) +
      replacementReserve;

    // Lorsque les dépenses avancées ne sont pas utilisées, les dépenses
    // totales correspondent aux dépenses SCHL calculées ci-dessus
    operatingExpensesTotal = operatingExpensesSCHL;
  }

  /**const totalExpenses = operatingExpensesSCHL + vacancyAmount;
  const netOperatingIncome = totalGrossRevenue - totalExpenses;
  const effectiveNetIncome = totalGrossRevenue - operatingExpensesTotal - vacancyAmount;**/
  const schlTotalExpenses = operatingExpensesSCHL + vacancyAmount;
  const totalExpenses = operatingExpensesTotal + vacancyAmount;
  const netOperatingIncome = totalGrossRevenue - schlTotalExpenses;
  const effectiveNetIncome = totalGrossRevenue - totalExpenses;
  const mortgageRate = (parseFloat(property.mortgageRate) || 5.5) / 100;
  let maxLoanAmount = 0;
  let maxDebtService = 0;
  let monthlyPayment = 0;
  let monthlyMortgageRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
  let amortizationYears = parseInt(property.amortization) || 25;
  let totalPayments = amortizationYears * 12;
  let maxLTVRatio = 0.8;

  if (property.financingType === 'private') {
    maxLTVRatio = (parseFloat(property.ltvRatio) || 0) / 100;
    maxLoanAmount = purchasePrice * maxLTVRatio;
    monthlyMortgageRate = mortgageRate / 12;
    monthlyPayment = maxLoanAmount * mortgageRate / 12;
    maxDebtService = monthlyPayment * 12;
  } else {
    const debtCoverageRatio = parseFloat(property.debtCoverageRatio) || 1.15;
    maxDebtService = netOperatingIncome / debtCoverageRatio;

    const qualificationRate = (parseFloat(property.qualificationRate) || 6) / 100;
    const monthlyQualRate = Math.pow(1 + qualificationRate / 2, 1 / 6) - 1;
    totalPayments = amortizationYears * 12;

    const maxLoanByRCD = monthlyQualRate > 0
      ? (maxDebtService / 12) * ((Math.pow(1 + monthlyQualRate, totalPayments) - 1) / (monthlyQualRate * Math.pow(1 + monthlyQualRate, totalPayments)))
      : 0;

    // Loan-to-value ratio ceiling based on financing type
    if (property.financingType === 'cmhc') {
      maxLTVRatio = 0.85;
    } else if (property.financingType === 'cmhc_aph') {
      const points = parseInt(property.aphPoints) || 0;
      maxLTVRatio = getAphMaxLtvRatio(points);
    }
    const maxLoanByLTV = purchasePrice * maxLTVRatio;
    maxLoanAmount = property.ignoreLTV
      ? maxLoanByRCD
      : Math.min(maxLoanByRCD, maxLoanByLTV);
  }

  const economicValue = maxLTVRatio > 0 ? maxLoanAmount / maxLTVRatio : 0;

  const cmhcPremiums = {
    standard: [
      { ltv: 65, rate: 0.026 },
      { ltv: 70, rate: 0.0285 },
      { ltv: 75, rate: 0.0335 },
      { ltv: 80, rate: 0.0435 },
      { ltv: 85, rate: 0.0535 }
    ],
    select: [
      { ltv: 90, rate: 0.059 },
      { ltv: 100, rate: 0.0615 }
    ],
    surcharge: 0.0025,
    rebates: { 50: 0.1, 70: 0.2, 100: 0.3 }
  };

  let cmhcPremium = 0;
  let cmhcTax = 0;
  let cmhcAnalysis = 0;
  if (["cmhc", "cmhc_aph"].includes(property.financingType)) {
    const ltvRatio = purchasePrice > 0 ? (maxLoanAmount / purchasePrice) * 100 : 0;
    const points = parseInt(property.aphPoints) || 0;
    const effectiveLtv = property.financingType === 'cmhc_aph'
      ? Math.min(ltvRatio, getAphMaxLtvRatio(points) * 100)
      : ltvRatio;
    let premiumRate = 0;

    if (property.financingType === 'cmhc_aph' && effectiveLtv > 85) {
      premiumRate = effectiveLtv <= 90 ? cmhcPremiums.select[0].rate : cmhcPremiums.select[1].rate;
    } else {
      const bracket = cmhcPremiums.standard.find(b => effectiveLtv <= b.ltv);
      premiumRate = bracket?.rate || cmhcPremiums.standard.at(-1).rate;
    }

    if (amortizationYears > 25) {
      premiumRate += ((amortizationYears - 25) / 5) * cmhcPremiums.surcharge;
    }

    if (property.financingType === 'cmhc_aph') {
      const rebate = points >= 100 ? 0.3 : points >= 70 ? 0.2 : points >= 50 ? 0.1 : 0;
      premiumRate = premiumRate * (1 - rebate);
    }

    const premiumBase = Math.max(maxLoanAmount - initialLoanAmount, 0);
    cmhcPremium = premiumBase * premiumRate;
    cmhcTax = cmhcPremium * 0.09;
    cmhcAnalysis = numberOfUnits * 150;
  }

  let originationFee = 0;
  if (property.financingType === 'private') {
    const fee = parseFloat(property.originationFee) || 0;
    originationFee =
      (property.originationFeeType || 'percentage') === 'currency'
        ? fee
        : (maxLoanAmount * fee) / 100;
  }

  const totalLoanAmount = maxLoanAmount + cmhcPremium;
  if (property.financingType !== 'private') {
    monthlyPayment = totalLoanAmount > 0 && monthlyMortgageRate > 0
      ? totalLoanAmount * (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalPayments)) /
        (Math.pow(1 + monthlyMortgageRate, totalPayments) - 1)
      : 0;
  }
  const downPayment = purchasePrice - maxLoanAmount;
  const annualDebtService = monthlyPayment * 12;
  // Le cashflow doit refléter toutes les dépenses, on utilise donc le
  // revenu net effectif plutôt que le NOI SCHL
  const cashFlow = effectiveNetIncome - annualDebtService;

  const acquisitionCostKeys = advancedExpenses
    ? [
        "inspection",
        "environmental1",
        "environmental2",
        "environmental3",
        "otherFees",
        "appraiser",
        "notary",
        "renovations",
        "cmhcAnalysis",
        "cmhcTax",
      ]
    : [
        "expertises",
        "notary",
        "renovations",
        "cmhcAnalysis",
        "cmhcTax",
        "otherFees",
      ];

  if (property.workCost !== undefined) {
    acquisitionCostKeys.push("workCost");
  }

  // La taxe de bienvenue ne s'applique que lors d'un achat initial
  if (!property.ignoreLTV) {
    acquisitionCostKeys.push("welcomeTax");
  }

  const acquisitionCosts = acquisitionCostKeys.reduce(
    (sum, key) => sum + (parseFloat(property[key]) || 0),
    0,
  ) + originationFee;

  const totalInvestment = downPayment + acquisitionCosts;

  const pricePerUnit = purchasePrice / numberOfUnits;
  const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
  const cashOnCashReturn = totalInvestment > 0 ? (cashFlow / totalInvestment) * 100 : 0;
  const actualDebtCoverageRatio = annualDebtService > 0 ? effectiveNetIncome / annualDebtService : 0;

  const grossRentMultiplier = totalGrossRevenue > 0 ? purchasePrice / totalGrossRevenue : 0;
  const netIncomeMultiplier = netOperatingIncome > 0 ? purchasePrice / netOperatingIncome : 0;

  let principalPaidYear1 = 0;
  if (monthlyPayment > 0) {
    let balance = totalLoanAmount;
    for (let i = 0; i < 12; i++) {
      const interest = balance * monthlyMortgageRate;
      const principal = monthlyPayment - interest;
      principalPaidYear1 += principal;
      balance -= principal;
    }
  }
  const loanPaydownReturn = downPayment > 0 ? (principalPaidYear1 / totalInvestment) * 100 : 0;

  const appreciationRate = 0.03;
  const appreciationReturn = downPayment > 0 ? ((purchasePrice * appreciationRate) / totalInvestment) * 100 : 0;

  const loanValueRatio = purchasePrice > 0 ? maxLoanAmount / purchasePrice * 100 : 0;
  const totalReturn = cashOnCashReturn + loanPaydownReturn + appreciationReturn;
  const valueGeneratedYear1 = cashFlow + principalPaidYear1 + (purchasePrice * appreciationRate);

  return {
    totalGrossRevenue,
    effectiveGrossRevenue,
    vacancyAmount,
    operatingExpensesSCHL,
    operatingExpensesTotal,
    totalExpenses,
    netOperatingIncome,
    effectiveNetIncome,
    maxLoanAmount,
    cmhcPremium,
    cmhcTax,
    totalLoanAmount,
    downPayment,
    economicValue,
    monthlyPayment,
    annualDebtService,
    maxDebtService,
    cashFlow,
    acquisitionCosts,
    totalInvestment,
    pricePerUnit,
    capRate,
    cashOnCashReturn,
    actualDebtCoverageRatio,
    grossRentMultiplier,
    netIncomeMultiplier,
    loanPaydownReturn,
    appreciationReturn,
    loanValueRatio,
    mortgageRate: mortgageRate * 100,
    totalReturn,
    valueGeneratedYear1,
    originationFee,
  };
};

export default calculateRentability;
