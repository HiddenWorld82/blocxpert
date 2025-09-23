// utils/calculateReturnAfterYears.js
// Calculate overall, annualized and internal rates of return after a number of years

function computeIRR(cashFlows) {
  // Bisection method to find rate that sets NPV to zero
  const npv = (rate) =>
    cashFlows.reduce((acc, cf, idx) => acc + cf / Math.pow(1 + rate, idx), 0);

  let low = -0.9999;
  let high = 1;
  let npvLow = npv(low);
  let npvHigh = npv(high);

  // Expand the search interval if the IRR is greater than 100%
  const maxHigh = 1024; // Allow IRR up to 102400%
  while (npvLow * npvHigh > 0 && high < maxHigh) {
    high *= 2;
    npvHigh = npv(high);
  }

  if (npvLow * npvHigh > 0) return 0; // Cannot find a valid IRR within range

  let mid = 0;
  for (let i = 0; i < 1000; i++) {
    mid = (low + high) / 2;
    const npvMid = npv(mid);
    if (Math.abs(npvMid) < 1e-7) break;
    if (npvMid * npvLow < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }
  return mid;
}

export default function calculateReturnAfterYears(
  property,
  analysis,
  years,
  incomeIncreaseRate = 0.02,
  expenseIncreaseRate = 0.025,
  valueIncreaseRate = 0.03,
  scenario = null,
  scenarioAnalysis = null,
) {
  const nYears = parseInt(years, 10);
  if (!analysis || !property || !nYears || nYears <= 0) {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      internalRateOfReturn: 0,
      valueGenerated: 0,
    };
  }

  const baseRevenue = analysis.effectiveGrossRevenue || 0;
  const baseExpenses = analysis.operatingExpensesTotal || 0;
  const annualDebtService = analysis.annualDebtService || 0;
  const totalInvestment = analysis.totalInvestment || 0;
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const mortgageRate = (parseFloat(property.mortgageRate) || 5.5) / 100;
  const amortizationYears = parseInt(property.amortization) || 25;

  let baseMonthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
  if (property.financingType === 'private') {
    baseMonthlyRate = mortgageRate / 12;
  }

  const monthlyPayment = analysis.monthlyPayment || 0;
  const totalLoanAmount = analysis.totalLoanAmount || 0;

  const refYears = scenario ? parseFloat(scenario.refinanceYears) || 0 : 0;
  const scenarioMortgageRate = scenario && scenario.financing
    ? (parseFloat(scenario.financing.mortgageRate) || 0) / 100
    : mortgageRate;
  let scenarioMonthlyRate = Math.pow(1 + scenarioMortgageRate / 2, 1 / 6) - 1;
  if (scenario && scenario.financing?.financingType === 'private') {
    scenarioMonthlyRate = scenarioMortgageRate / 12;
  }
  const scenarioMonthlyPayment = scenario
    ? scenarioAnalysis?.monthlyPayment ?? 0
    : monthlyPayment;
  const scenarioAnnualDebtService = scenario
    ? scenarioAnalysis?.annualDebtService ?? scenarioMonthlyPayment * 12
    : annualDebtService;

  const scenarioRevenueBase =
    scenarioAnalysis?.effectiveGrossRevenue ?? null;
  const scenarioExpensesBase =
    scenarioAnalysis?.operatingExpensesTotal ?? null;
  const hasScenarioCashflowOverrides =
    scenarioRevenueBase != null || scenarioExpensesBase != null;

  // Calculate cash flows with annual increases
  let revenue = baseRevenue;
  let expenses = baseExpenses;
  let cashFlowTotal = 0;
  const cashFlows = [-totalInvestment];
  let balance = totalLoanAmount;
  let principalPaid = 0;
  let usingScenarioValues = false;
  for (let year = 1; year <= nYears; year++) {
    const useScenario = scenario && year > refYears;
    let revenueSwitched = false;
    let expensesSwitched = false;
    if (useScenario && !usingScenarioValues && hasScenarioCashflowOverrides) {
      if (scenarioRevenueBase != null) {
        revenue = scenarioRevenueBase;
        revenueSwitched = true;
      }
      if (scenarioExpensesBase != null) {
        expenses = scenarioExpensesBase;
        expensesSwitched = true;
      }
      usingScenarioValues = true;
    }
    if (year > 1) {
      if (!revenueSwitched) {
        revenue *= 1 + incomeIncreaseRate;
      }
      if (!expensesSwitched) {
        expenses *= 1 + expenseIncreaseRate;
      }
    }
    const annualCF =
      revenue - expenses - (useScenario ? scenarioAnnualDebtService : annualDebtService);
    cashFlowTotal += annualCF;
    cashFlows.push(annualCF);

    const currentMonthlyRate = useScenario ? scenarioMonthlyRate : baseMonthlyRate;
    const currentMonthlyPayment = useScenario
      ? scenarioMonthlyPayment
      : monthlyPayment;
    for (let m = 0; m < 12 && balance > 0; m++) {
      const interest = balance * currentMonthlyRate;
      const principal = Math.min(currentMonthlyPayment - interest, balance);
      principalPaid += principal;
      balance -= principal;
    }
    if (year === refYears && scenarioAnalysis && nYears > refYears) {
      const newLoanAmount = scenarioAnalysis.totalLoanAmount || 0;
      const equityWithdraw = newLoanAmount - balance;
      cashFlowTotal += equityWithdraw;
      cashFlows[year] += equityWithdraw;
      balance = newLoanAmount;
      principalPaid = 0;
    }
  }

  const propertyValue =
    purchasePrice * Math.pow(1 + valueIncreaseRate, nYears);
  const appreciationAmount = propertyValue - purchasePrice;

  const valueGenerated = cashFlowTotal + principalPaid + appreciationAmount;
  const totalReturn =
    totalInvestment > 0 ? (valueGenerated / totalInvestment) * 100 : 0;
  const annualizedReturn =
    totalReturn > -100 && nYears > 0
      ? (Math.pow(1 + totalReturn / 100, 1 / nYears) - 1) * 100
      : 0;

  const scenarioOccursWithinHorizon =
    scenario &&
    scenarioAnalysis?.economicValue != null &&
    nYears > refYears;
  const exitValue = scenarioOccursWithinHorizon
    ? scenarioAnalysis.economicValue
    : propertyValue;
  const saleNet = exitValue - balance;
  if (cashFlows.length > 1) {
    cashFlows[nYears] += saleNet;
  }
  const irr = totalInvestment > 0 ? computeIRR(cashFlows) * 100 : 0;

  return {
    totalReturn,
    annualizedReturn,
    internalRateOfReturn: irr,
    valueGenerated,
  };
}
