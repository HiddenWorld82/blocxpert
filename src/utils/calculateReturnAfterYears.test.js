import test from 'node:test';
import assert from 'node:assert/strict';
import calculateReturnAfterYears from './calculateReturnAfterYears.js';

// Simple scenario with no financing to verify computation
// Cash flow: 1000$/year, purchase price: 100000$, appreciation 3%
// After 5 years: cash flow 5000, property value 115000 => 20% return
// Annualized return ≈ 3.71%
// IRR ≈ 3.78%

test('calculates multi-year, annualized and internal rate returns', () => {
  const property = {
    purchasePrice: 100000,
    mortgageRate: 5,
    amortization: 25,
    financingType: 'conventional',
  };
  const analysis = {
    cashFlow: 1000,
    totalInvestment: 100000,
    monthlyPayment: 0,
    totalLoanAmount: 0,
  };

  const { totalReturn, annualizedReturn, internalRateOfReturn } = calculateReturnAfterYears(property, analysis, 5);
  assert.ok(Math.abs(totalReturn - 20) < 0.01);
  assert.ok(Math.abs(annualizedReturn - 3.71) < 0.01);
  assert.ok(Math.abs(internalRateOfReturn - 3.78) < 0.01);
});
