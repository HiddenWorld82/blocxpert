import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AmortizationPage = ({
  analysis,
  currentProperty,
  setCurrentStep,
  scenario,
  scenarioAnalysis,
}) => {
  const { t } = useLanguage();
  const loanAmount = analysis.totalLoanAmount || 0;
  const monthlyPayment = analysis.monthlyPayment || 0;
  const mortgageRate = parseFloat(currentProperty.mortgageRate) || 0;
  const amortYears = parseInt(currentProperty.amortization) || 0;
  const monthlyRate =
    currentProperty.financingType === 'private'
      ? mortgageRate / 100 / 12
      : Math.pow(1 + mortgageRate / 100 / 2, 1 / 6) - 1;
  let balance = loanAmount;
  let cumulativePrincipal = 0;
  const appreciationRate = parseFloat(currentProperty.appreciationRate) || 0.03;
  const purchasePrice = parseFloat(currentProperty.purchasePrice) || 0;
  const monthlyAppreciationFactor = Math.pow(1 + appreciationRate, 1 / 12);
  let propertyValue = purchasePrice;
  const baseCosts = analysis.acquisitionCosts || 0;
  const scenarioCosts = scenarioAnalysis?.acquisitionCosts || 0;
  const additionalCosts = Math.max(scenarioCosts - baseCosts, 0);
  let totalCosts = baseCosts;
  const rows = [];

  const refinanceMonth = scenario
    ? (parseFloat(scenario.refinanceYears) || 0) * 12
    : 0;
  const newLoanAmount = scenarioAnalysis?.totalLoanAmount || 0;
  const newEconomicValue = scenarioAnalysis?.economicValue || 0;
  const newMonthlyPayment = scenarioAnalysis?.monthlyPayment || 0;
  const newMortgageRate = parseFloat(scenario?.financing?.mortgageRate) || 0;
  const newAmortYears = parseInt(scenario?.financing?.amortization) || 0;
  const newMonthlyRate =
    scenario?.financing?.financingType === 'private'
      ? newMortgageRate / 100 / 12
      : Math.pow(1 + newMortgageRate / 100 / 2, 1 / 6) - 1;

  const totalMonths = scenario
    ? refinanceMonth + newAmortYears * 12
    : amortYears * 12;

  if (
    scenario &&
    refinanceMonth === 0 &&
    (newEconomicValue > propertyValue || newLoanAmount > propertyValue)
  ) {
    propertyValue = Math.max(newEconomicValue, newLoanAmount);
    totalCosts += additionalCosts;
  }

  for (let month = 1; month <= totalMonths; month++) {
    propertyValue *= monthlyAppreciationFactor;
    if (scenario && month === refinanceMonth) {
      if (newEconomicValue > propertyValue || newLoanAmount > propertyValue) {
        propertyValue = Math.max(newEconomicValue, newLoanAmount);
      }
      totalCosts += additionalCosts;
    }
    const useScenario = scenario && month > refinanceMonth;
    if (scenario && month === refinanceMonth + 1) {
      balance = newLoanAmount;
    }
    const rate = useScenario ? newMonthlyRate : monthlyRate;
    const payment = useScenario ? newMonthlyPayment : monthlyPayment;
    const interest = balance * rate;
    const principal = Math.min(payment - interest, balance);
    balance -= principal;
    cumulativePrincipal += principal;
    const equity = propertyValue - balance - totalCosts;
    rows.push({
      month,
      balance,
      interest,
      principal,
      cumulativePrincipal,
      propertyValue,
      equity,
    });
  }
  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  if (rows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{t('amortization.title')}</h2>
            <button
              onClick={() => setCurrentStep('report')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('back')}
            </button>
          </div>
          <p className="text-center text-gray-600">{t('amortization.noData')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{t('amortization.title')}</h2>
          <button
            onClick={() => setCurrentStep('report')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('back')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-center">{t('amortization.period')}</th>
                <th className="px-2 py-1 text-center">{t('amortization.loanBalance')}</th>
                <th className="px-2 py-1 text-center">{t('amortization.interestPayment')}</th>
                <th className="px-2 py-1 text-center">{t('amortization.principalPayment')}</th>
                <th className="px-2 py-1 text-center">{t('amortization.cumulativePrincipal')}</th>
                <th className="px-2 py-1 text-center">{t('amortization.propertyValue')}</th>
                <th className="px-2 py-1 text-center">{t('amortization.equity')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.month}
                  className={
                    scenario && r.month === refinanceMonth
                      ? 'border-t bg-green-200'
                      : r.month % 12 === 0
                      ? 'border-t bg-gray-200'
                      : 'border-t'
                  }
                >
                  <td className="px-2 py-1 text-center">{r.month}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.balance)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.interest)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.principal)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.cumulativePrincipal)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.propertyValue)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AmortizationPage;
