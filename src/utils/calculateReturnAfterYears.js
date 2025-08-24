// utils/calculateReturnAfterYears.js
// Calculate overall and annualized return after a number of years
export default function calculateReturnAfterYears(property, analysis, years) {
  const nYears = parseInt(years, 10);
  if (!analysis || !property || !nYears || nYears <= 0) {
    return { totalReturn: 0, annualizedReturn: 0, valueGenerated: 0 };
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
  if (monthlyPayment > 0 && totalLoanAmount > 0) {
    let balance = totalLoanAmount;
    const months = Math.min(nYears * 12, totalPayments);
    for (let i = 0; i < months && balance > 0; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      principalPaid += principal;
      balance -= principal;
    }
  }

  const appreciationRate = 0.03;
  const appreciationAmount = purchasePrice * (Math.pow(1 + appreciationRate, nYears) - 1);
  const cashFlowTotal = cashFlow * nYears;

  const valueGenerated = cashFlowTotal + principalPaid + appreciationAmount;
  const totalReturn = totalInvestment > 0 ? (valueGenerated / totalInvestment) * 100 : 0;
  const annualizedReturn = totalReturn > -100 && nYears > 0
    ? (Math.pow(1 + totalReturn / 100, 1 / nYears) - 1) * 100
    : 0;

  return { totalReturn, annualizedReturn, valueGenerated };
}
