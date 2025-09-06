import test from 'node:test';
import assert from 'node:assert/strict';
import calculateReturnAfterYears from './calculateReturnAfterYears.js';

// Simple scenario with no financing to verify computation
// Cash flow: 1000$/year, purchase price: 100000$, appreciation 3%
// After 5 years: cash flow 5000, appreciation ~15927, total value ~20927 => 20.927% return
// Annualized return ≈ 3.88%
// IRR ≈ 3.94%

test('calculates multi-year, annualized and internal rate returns', () => {
  const property = {
    purchasePrice: 100000,
    mortgageRate: 5,
    amortization: 25,
    financingType: 'conventional',
  };
  const analysis = {
    cashFlow: 1000,
    effectiveGrossRevenue: 5000,
    operatingExpensesTotal: 4000,
    annualDebtService: 0,
    totalInvestment: 100000,
    monthlyPayment: 0,
    totalLoanAmount: 0,
  };

  const { totalReturn, annualizedReturn, internalRateOfReturn } = calculateReturnAfterYears(property, analysis, 5, 0, 0, 0.03);
  assert.ok(Math.abs(totalReturn - 20.927) < 0.01);
  assert.ok(Math.abs(annualizedReturn - 3.88) < 0.01);
  assert.ok(Math.abs(internalRateOfReturn - 3.94) < 0.01);
});

test('scenario after evaluation period does not impact IRR', () => {
  const property = {
    purchasePrice: 100000,
    mortgageRate: 5,
    amortization: 25,
    financingType: 'conventional',
  };
  const analysis = {
    cashFlow: 1000,
    effectiveGrossRevenue: 5000,
    operatingExpensesTotal: 4000,
    annualDebtService: 0,
    totalInvestment: 100000,
    monthlyPayment: 0,
    totalLoanAmount: 0,
  };

  const scenario = {
    refinanceYears: 5,
    financing: { financingType: 'conventional', mortgageRate: 4 },
    type: 'refinancing',
  };
  const scenarioAnalysis = {
    annualDebtService: 500,
    totalLoanAmount: 80000,
    monthlyPayment: 40,
  };

  const baseRes = calculateReturnAfterYears(property, analysis, 3, 0, 0, 0.03);
  const scenarioRes = calculateReturnAfterYears(
    property,
    analysis,
    3,
    0,
    0,
    0.03,
    scenario,
    scenarioAnalysis,
  );

  assert.ok(
    Math.abs(baseRes.internalRateOfReturn - scenarioRes.internalRateOfReturn) < 1e-6,
  );
});

test('equity withdrawal from refinancing affects IRR beyond refinance year', () => {
  const property = {
    purchasePrice: 100000,
    mortgageRate: 5,
    amortization: 25,
    financingType: 'conventional',
  };
  const analysis = {
    cashFlow: 1000,
    effectiveGrossRevenue: 5000,
    operatingExpensesTotal: 4000,
    annualDebtService: 0,
    totalInvestment: 100000,
    monthlyPayment: 0,
    totalLoanAmount: 0,
  };

  const scenario = {
    refinanceYears: 5,
    financing: { financingType: 'conventional', mortgageRate: 4 },
    type: 'refinancing',
  };
  const scenarioAnalysis = {
    annualDebtService: 0,
    totalLoanAmount: 50000,
    monthlyPayment: 0,
  };

  const baseRes = calculateReturnAfterYears(property, analysis, 6, 0, 0, 0.03);
  const scenarioRes = calculateReturnAfterYears(
    property,
    analysis,
    6,
    0,
    0,
    0.03,
    scenario,
    scenarioAnalysis,
  );

  assert.ok(
    Math.abs(scenarioRes.internalRateOfReturn - baseRes.internalRateOfReturn) > 1e-6,
  );
  assert.ok(Math.abs(scenarioRes.internalRateOfReturn - 3.9224) < 0.01);
});

test('uses scenario debt values when provided, even if zero', () => {
  const property = {
    purchasePrice: 100000,
    mortgageRate: 5,
    amortization: 25,
    financingType: 'conventional',
  };
  const analysis = {
    cashFlow: 2000,
    effectiveGrossRevenue: 12000,
    operatingExpensesTotal: 4000,
    annualDebtService: 6000,
    totalInvestment: 100000,
    monthlyPayment: 500,
    totalLoanAmount: 0,
  };

  const scenario = {
    refinanceYears: 1,
    financing: { financingType: 'conventional', mortgageRate: 5 },
    type: 'refinancing',
  };
  const scenarioAnalysis = {
    annualDebtService: 0,
    totalLoanAmount: 0,
    monthlyPayment: 0,
  };

  const baseRes = calculateReturnAfterYears(property, analysis, 2, 0, 0, 0);
  const scenarioRes = calculateReturnAfterYears(
    property,
    analysis,
    2,
    0,
    0,
    0,
    scenario,
    scenarioAnalysis,
  );

  assert.ok(
    Math.abs(scenarioRes.totalReturn - baseRes.totalReturn) > 1e-6,
  );
  assert.ok(scenarioRes.totalReturn > baseRes.totalReturn);
});

test('equity withdrawal uses max loan amount excluding premiums', () => {
  const property = {
    purchasePrice: 100000,
    mortgageRate: 5,
    amortization: 25,
    financingType: 'conventional',
  };
  const analysis = {
    cashFlow: 1000,
    effectiveGrossRevenue: 5000,
    operatingExpensesTotal: 4000,
    annualDebtService: 0,
    totalInvestment: 100000,
    monthlyPayment: 0,
    totalLoanAmount: 0,
  };

  const scenario = {
    refinanceYears: 5,
    financing: { financingType: 'conventional', mortgageRate: 4 },
    type: 'refinancing',
  };
  const scenarioAnalysis = {
    annualDebtService: 0,
    totalLoanAmount: 55000,
    monthlyPayment: 0,
    maxLoanAmount: 50000,
    cmhcPremium: 5000,
  };

  const scenarioRes = calculateReturnAfterYears(
    property,
    analysis,
    6,
    0,
    0,
    0.03,
    scenario,
    scenarioAnalysis,
  );

  assert.ok(Math.abs(scenarioRes.internalRateOfReturn - 3.118) < 0.01);
});
