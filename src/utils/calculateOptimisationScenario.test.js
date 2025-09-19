import test from 'node:test';
import assert from 'node:assert/strict';
import calculateOptimisationScenario from './calculateOptimisationScenario.js';

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

test('calculateOptimisationScenario adjusts equity with fees', () => {
  const baseScenario = {
    marketValue: '1200000',
    revenue: {},
    operatingExpenses: {},
    financing: {
      financingType: 'conventional',
      mortgageRate: '5',
      qualificationRate: '5',
      amortization: '25',
      debtCoverageRatio: '1.1',
    },
    refinanceYears: '0',
  };

  const noFees = calculateOptimisationScenario(
    { ...baseScenario, financingFees: {} },
    baseProperty,
    null,
    false,
  );

  const withFees = calculateOptimisationScenario(
    { ...baseScenario, financingFees: { other: '1000' } },
    baseProperty,
    null,
    false,
  );

  assert.equal(noFees.analysisProperty.purchasePrice, 1_200_000);
  assert.ok(
    Math.abs(noFees.equityWithdrawal - withFees.equityWithdrawal - 1000) < 1e-6,
  );
});

test('calculateOptimisationScenario keeps existing property performance when not overridden', () => {
  const scenario = {
    marketValue: '1200000',
    revenue: {},
    operatingExpenses: {},
    financing: {
      financingType: 'conventional',
      mortgageRate: '5',
      qualificationRate: '5',
      amortization: '25',
      debtCoverageRatio: '1.1',
    },
    financingFees: {},
    refinanceYears: '0',
  };

  const { analysisProperty, analysis } = calculateOptimisationScenario(
    scenario,
    baseProperty,
    null,
    false,
  );

  assert.equal(analysisProperty.annualRent, baseProperty.annualRent);
  assert.ok(analysis.totalGrossRevenue > 0);
});

test('calculateOptimisationScenario preserves numeric strings with locale formatting', () => {
  const scenario = {
    marketValue: '1 200 000',
    revenue: {},
    operatingExpenses: {},
    financing: {
      financingType: 'conventional',
      mortgageRate: '5,25',
      qualificationRate: '5,25',
      amortization: '25',
      debtCoverageRatio: '1,1',
    },
    financingFees: {},
    refinanceYears: '0',
  };

  const property = {
    ...baseProperty,
    purchasePrice: '950 000',
    annualRent: '200 000',
    municipalTaxes: '5 000',
  };

  const { analysis } = calculateOptimisationScenario(
    scenario,
    property,
    null,
    false,
  );

  assert.ok(analysis.totalGrossRevenue > 0);
  assert.ok(analysis.netOperatingIncome > 0);
});
