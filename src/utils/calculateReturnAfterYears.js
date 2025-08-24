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
  if (npvLow * npvHigh > 0) return 0; // Cannot find a valid IRR

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

export default function calculateReturnAfterYears(property, analysis, years) {
  const nYears = parseInt(years, 10);
  if (!analysis || !property || !nYears || nYears <= 0) {
    return { totalReturn: 0, annualizedReturn: 0, internalRateOfReturn: 0, valueGenerated: 0 };
  }

  const cashFlow = analysis.cashFlow || 0; // annual cash flow
  const totalInvestment = analysis.totalInvestment || 0;
  const purchasePrice = parseFloat(property.purchasePrice) || 0;
  const mortgageRate = (parseFloat(property.mortgageRate) || 5.5) / 100;
  const amortizationYears = parseInt(property.amortization) || 25;
  const totalPayments = amortizationYears * 12;

  let monthlyRate = Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
  if (property.financingType === 'private') {
    monthlyRate = mortgageRate / 12;
  }

  const monthlyPayment = analysis.monthlyPayment || 0;
  const totalLoanAmount = analysis.totalLoanAmount || 0;

  let principalPaid = 0;
  let balance = totalLoanAmount;
  if (monthlyPayment > 0 && totalLoanAmount > 0) {
    const months = Math.min(nYears * 12, totalPayments);
    for (let i = 0; i < months && balance > 0; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      principalPaid += principal;
      balance -= principal;
    }
  }

  const appreciationRate = 0.03;
  const propertyValue = purchasePrice * Math.pow(1 + appreciationRate, nYears);
  const appreciationAmount = propertyValue - purchasePrice;
  const cashFlowTotal = cashFlow * nYears;

  const valueGenerated = cashFlowTotal + principalPaid + appreciationAmount;
  const totalReturn = totalInvestment > 0 ? (valueGenerated / totalInvestment) * 100 : 0;
  const annualizedReturn = totalReturn > -100 && nYears > 0
    ? (Math.pow(1 + totalReturn / 100, 1 / nYears) - 1) * 100
    : 0;

  // Build cash flow array for IRR calculation
  const cashFlows = [-totalInvestment];
  for (let i = 1; i <= nYears; i++) {
    cashFlows.push(cashFlow);
  }
  const saleNet = propertyValue - balance;
  if (cashFlows.length > 1) {
    cashFlows[nYears] += saleNet;
  }
  const irr = totalInvestment > 0 ? computeIRR(cashFlows) * 100 : 0;

  return { totalReturn, annualizedReturn, internalRateOfReturn: irr, valueGenerated };
}
