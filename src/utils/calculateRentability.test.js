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
    { financingType: 'cmhc_aph', aphPoints: 50, ratio: 0.85 },
    { financingType: 'cmhc_aph', aphPoints: 70, ratio: 0.90 },
    { financingType: 'cmhc_aph', aphPoints: 100, ratio: 0.95 },
  ];

  scenarios.forEach(({ financingType, aphPoints, ratio }) => {
    const property = { ...baseProperty, financingType, aphPoints };
    const result = calculateRentability(property, false, { initialLoanAmount: 0 });
    assert.ok(Math.abs(result.economicValue - result.maxLoanAmount / ratio) < 1e-6);
  });
});

test('APH premium uses capped LTV based on points', () => {
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
    financingType: 'cmhc_aph',
    aphPoints: 50,
    ignoreLTV: true,
    debtCoverageRatio: 1.1,
    mortgageRate: 5,
    qualificationRate: 5,
    amortization: 25,
  };

  const result = calculateRentability(property, false, { initialLoanAmount: 0 });
  const premiumRate = result.cmhcPremium / result.maxLoanAmount;
  const expectedRate = 0.0535 * 0.9; // 10% rebate on 85% LTV rate
  assert.ok(Math.abs(premiumRate - expectedRate) < 1e-6);
});

test('Private financing uses interest-only payments and RPV', () => {
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
    financingType: 'private',
    ltvRatio: 60,
    mortgageRate: 10,
    originationFee: 2,
    originationFeeType: 'percentage'
  };

  const result = calculateRentability(property, false, { initialLoanAmount: 0 });
  assert.equal(Math.round(result.maxLoanAmount), 600000);
  assert.equal(Math.round(result.monthlyPayment), 5000);
  assert.equal(Math.round(result.acquisitionCosts), 12000);
  assert.equal(result.loanPaydownReturn, 0);
});
