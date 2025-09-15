import test from 'node:test';
import assert from 'node:assert/strict';
import calculateRenewScenario from './calculateRenewScenario.js';
import calculateRentability from './calculateRentability.js';

const baseProperty = {
  purchasePrice: 1_000_000,
  annualRent: 200_000,
  vacancyRate: 0,
  municipalTaxes: 0,
  schoolTaxes: 0,
  insurance: 0,
  maintenance: 0,
  managementRate: 0,
  concierge: 0,
  electricityHeating: 0,
  otherExpenses: 0,
  financingType: 'conventional',
  debtCoverageRatio: 1.1,
  mortgageRate: 5,
  qualificationRate: 5,
  amortization: 25,
  term: 0,
  numberOfUnits: 1,
};

test('calculateRenewScenario uses remaining amortization and existing loan', () => {
  const parentScenario = {
    financing: {
      financingType: 'conventional',
      mortgageRate: 5,
      qualificationRate: 5,
      amortization: 25,
      term: 0,
      debtCoverageRatio: 1.1,
    },
    acquisitionCosts: {},
  };

  const scenario = {
    revenueGrowthPct: '0',
    expenseGrowthPct: '0',
    valueAppreciationPct: '0',
    financing: { mortgageRate: '5', term: '5' },
  };

  const { analysisProperty, combinedFinancing, analysis } = calculateRenewScenario(
    scenario,
    baseProperty,
    parentScenario,
    false,
  );

  const baseline = calculateRentability(
    { ...baseProperty, ...parentScenario.financing },
    false,
  );

  assert.equal(combinedFinancing.amortization, '25');
  assert.ok(Math.abs(analysis.maxLoanAmount - baseline.maxLoanAmount) < 1e-6);
  assert.ok(Math.abs(analysis.totalLoanAmount - baseline.maxLoanAmount) < 1e-6);
  assert.equal(analysisProperty.purchasePrice, baseProperty.purchasePrice);
});
