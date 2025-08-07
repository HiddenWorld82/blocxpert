// utils/calculateRentability.js
const calculateRentability = (property, advancedExpenses) => {
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const numberOfUnits = parseInt(property.numberOfUnits) || 1;

  const grossRent = parseFloat(property.annualRent) || 0;
  const totalGrossRevenue = grossRent +
    (parseFloat(property.parkingRevenue) || 0) +
    (parseFloat(property.internetRevenue) || 0) +
    (parseFloat(property.storageRevenue) || 0) +
    (parseFloat(property.otherRevenue) || 0);

  const vacancyRate = (parseFloat(property.vacancyRate) || 0) / 100;
  const effectiveGrossRevenue = totalGrossRevenue * (1 - vacancyRate);

  let operatingExpenses = 0;
  if (advancedExpenses) {
    operatingExpenses =
      (parseFloat(property.municipalTaxes) || 0) +
      (parseFloat(property.schoolTaxes) || 0) +
      (parseFloat(property.heating) || 0) +
      (parseFloat(property.electricity) || 0) +
      (parseFloat(property.insurance) || 0) +
      (parseFloat(property.maintenance) || (365 * numberOfUnits)) +
      (totalGrossRevenue * (parseFloat(property.managementRate) || 0) / 100) +
      (parseFloat(property.concierge) || (610 * numberOfUnits)) +
      (parseFloat(property.landscaping) || 0) +
      (parseFloat(property.snowRemoval) || 0) +
      (parseFloat(property.extermination) || 0) +
      (parseFloat(property.fireInspection) || 0) +
      (parseFloat(property.advertising) || 0) +
      (parseFloat(property.legal) || 0) +
      (parseFloat(property.accounting) || 0) +
      (parseFloat(property.elevator) || 0) +
      (parseFloat(property.cableInternet) || 0) +
      (parseFloat(property.appliances) || 0) +
      (parseFloat(property.garbage) || 0) +
      (parseFloat(property.washerDryer) || 0) +
      (parseFloat(property.hotWater) || 0) +
      (parseFloat(property.otherExpenses) || 0);
  } else {
    operatingExpenses =
      (parseFloat(property.municipalTaxes) || 0) +
      (parseFloat(property.schoolTaxes) || 0) +
      (parseFloat(property.electricityHeating) || 0) +
      (parseFloat(property.otherExpenses) || 0);
  }

  const netOperatingIncome = effectiveGrossRevenue - operatingExpenses;
  const debtCoverageRatio = parseFloat(property.debtCoverageRatio) || 1.15;
  const maxDebtService = netOperatingIncome / debtCoverageRatio;

  const qualificationRate = (parseFloat(property.qualificationRate) || 6) / 100;
  const mortgageRate = (parseFloat(property.mortgageRate) || 5.5) / 100;
  const amortizationYears = parseInt(property.amortization) || 25;
  const monthlyQualRate = qualificationRate / 12;
  const totalPayments = amortizationYears * 12;

  const maxLoanByRCD = monthlyQualRate > 0
    ? maxDebtService / 12 * ((Math.pow(1 + monthlyQualRate, totalPayments) - 1) / (monthlyQualRate * Math.pow(1 + monthlyQualRate, totalPayments)))
    : 0;

  let maxLTVRatio = 0.75;
  if (property.financingType === 'cmhc') maxLTVRatio = 0.75;
  else if (property.financingType === 'cmhc_aph') {
    const points = parseInt(property.aphPoints) || 0;
    if (points >= 70) maxLTVRatio = 0.95;
    else if (points >= 50) maxLTVRatio = 0.85;
  }
  const maxLoanByLTV = purchasePrice * maxLTVRatio;
  const maxLoanAmount = Math.min(maxLoanByRCD, maxLoanByLTV);

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
  if (["cmhc", "cmhc_aph"].includes(property.financingType)) {
    const ltvRatio = (maxLoanAmount / purchasePrice) * 100;
    let premiumRate = 0;

    if (property.financingType === 'cmhc_aph' && ltvRatio > 85) {
      premiumRate = ltvRatio <= 90 ? cmhcPremiums.select[0].rate : cmhcPremiums.select[1].rate;
    } else {
      const bracket = cmhcPremiums.standard.find(b => ltvRatio <= b.ltv);
      premiumRate = bracket?.rate || cmhcPremiums.standard.at(-1).rate;
    }

    if (amortizationYears >= 25) premiumRate += cmhcPremiums.surcharge;

    if (property.financingType === 'cmhc_aph') {
      const points = parseInt(property.aphPoints) || 0;
      const rebate = points >= 100 ? 0.3 : points >= 70 ? 0.2 : points >= 50 ? 0.1 : 0;
      premiumRate = premiumRate * (1 - rebate);
    }

    cmhcPremium = maxLoanAmount * premiumRate;
    cmhcTax = cmhcPremium * 0.09;
  }

  const totalLoanAmount = maxLoanAmount + cmhcPremium;
  const downPayment = purchasePrice - maxLoanAmount;
  const monthlyMortgageRate = mortgageRate / 12;
  const monthlyPayment = totalLoanAmount > 0 && monthlyMortgageRate > 0
    ? totalLoanAmount * (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalPayments)) /
      (Math.pow(1 + monthlyMortgageRate, totalPayments) - 1)
    : 0;
  const annualDebtService = monthlyPayment * 12;
  const cashFlow = netOperatingIncome - annualDebtService;

  const acquisitionCosts = (
    advancedExpenses
      ? [
          "inspection",
          "environmental1",
          "environmental2",
          "environmental3",
          "otherTests",
          "appraiser",
          "notary",
          "renovations",
          "cmhcAnalysis",
          "cmhcTax",
          "welcomeTax",
        ]
      : [
          "expertises",
          "notary",
          "renovations",
          "cmhcAnalysis",
          "cmhcTax",
          "welcomeTax",
        ]
  ).reduce((sum, key) => sum + (parseFloat(property[key]) || 0), 0);

  const totalInvestment = downPayment + acquisitionCosts;

  const pricePerUnit = purchasePrice / numberOfUnits;
  const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
  const cashOnCashReturn = totalInvestment > 0 ? (cashFlow / totalInvestment) * 100 : 0;
  const actualDebtCoverageRatio = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;

  return {
    totalGrossRevenue,
    effectiveGrossRevenue,
    vacancyAmount: totalGrossRevenue - effectiveGrossRevenue,
    operatingExpenses,
    netOperatingIncome,
    maxLoanAmount,
    cmhcPremium,
    cmhcTax,
    totalLoanAmount,
    downPayment,
    monthlyPayment,
    annualDebtService,
    maxDebtService,
    cashFlow,
    acquisitionCosts,
    totalInvestment,
    pricePerUnit,
    capRate,
    cashOnCashReturn,
    actualDebtCoverageRatio
  };
};

export default calculateRentability;
