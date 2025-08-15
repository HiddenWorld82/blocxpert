import test from 'node:test';
import assert from 'node:assert/strict';
import calculateRentability from './calculateRentability.js';

test('CMHC premium is based on the difference between new and initial loan', () => {
  const property = {
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
    financingType: 'cmhc',
    debtCoverageRatio: 1.1,
    mortgageRate: 5,
    qualificationRate: 5,
    amortization: 25,
  };

  const baseResult = calculateRentability(property, false, { initialLoanAmount: 0 });
  const withInitial = calculateRentability(property, false, { initialLoanAmount: 200_000 });

  const premiumRate = baseResult.cmhcPremium / baseResult.maxLoanAmount;
  const expectedPremium = (withInitial.maxLoanAmount - 200_000) * premiumRate;

  assert.ok(Math.abs(withInitial.cmhcPremium - expectedPremium) < 1e-6);
});

test('economic value uses correct loan-to-value ratio', () => {
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
    debtCoverageRatio: 1.1,
    mortgageRate: 5,
    qualificationRate: 5,
    amortization: 25,
  };

  const scenarios = [
    { financingType: 'conventional', ratio: 0.80 },
    { financingType: 'cmhc', ratio: 0.85 },
    { financingType: 'cmhc_aph', aphPoints: 70, ratio: 0.95 },
  ];

  scenarios.forEach(({ financingType, aphPoints, ratio }) => {
    const property = { ...baseProperty, financingType, aphPoints };
    const result = calculateRentability(property, false, { initialLoanAmount: 0 });
    assert.ok(Math.abs(result.economicValue - result.maxLoanAmount / ratio) < 1e-6);
  });
});