import test from 'node:test';
import assert from 'node:assert/strict';
import calculateFutureScenario from './calculateFutureScenario.js';

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
  numberOfUnits: 1,
};

test('calculateFutureScenario scales values and adjusts equity with fees', () => {
  const baseScenario = {
    revenueGrowthPct: '0',
    expenseGrowthPct: '0',
    valueAppreciationPct: '0',
    refinanceYears: '0',
    marketValue: '1100000',
    financing: {
      financingType: 'conventional',
      mortgageRate: '5',
      qualificationRate: '5',
      amortization: '25',
      debtCoverageRatio: '1.1',
    },
  };

  const noFees = calculateFutureScenario(
    { ...baseScenario, financingFees: {} },
    baseProperty,
    null,
    false,
  );

  const withFees = calculateFutureScenario(
    { ...baseScenario, financingFees: { other: '5000' } },
    baseProperty,
    null,
    false,
  );

  assert.equal(noFees.analysisProperty.purchasePrice, 1_100_000);
  assert.ok(
    Math.abs(noFees.equityWithdrawal - withFees.equityWithdrawal - 5000) <
      1e-6,
  );
});

test('calculateFutureScenario uses first year after refinancing for rentability inputs', () => {
  const scenario = {
    revenueGrowthPct: '5',
    expenseGrowthPct: '3',
    valueAppreciationPct: '0',
    refinanceYears: '2',
    marketValue: '1100000',
    financing: {
      financingType: 'conventional',
      mortgageRate: '5',
      qualificationRate: '5',
      amortization: '25',
      debtCoverageRatio: '1.1',
    },
    financingFees: {},
  };

  const property = {
    ...baseProperty,
    municipalTaxes: 10_000,
  };

  const { analysisProperty } = calculateFutureScenario(
    scenario,
    property,
    null,
    false,
  );

  const expectedRevenue =
    baseProperty.annualRent * Math.pow(1 + 0.05, 3); // years + 1
  const expectedExpenses =
    property.municipalTaxes * Math.pow(1 + 0.03, 3);

  assert.ok(Math.abs(analysisProperty.annualRent - expectedRevenue) < 1e-6);
  assert.ok(Math.abs(analysisProperty.municipalTaxes - expectedExpenses) < 1e-6);
});
