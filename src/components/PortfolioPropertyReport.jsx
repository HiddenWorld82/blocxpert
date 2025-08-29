import React, { useMemo, useRef } from 'react';
import KeyIndicators from './sections/KeyIndicators';
import FinancialSummary from './sections/FinancialSummary';
import FinancingSummary from './sections/FinancingSummary';
import calculateRentability from '../utils/calculateRentability';
import calculateReturnAfterYears from '../utils/calculateReturnAfterYears';

function formatCurrency(val) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
}

function formatPercent(val) {
  return `${new Intl.NumberFormat('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0)}%`;
}

function calculateMortgage(property) {
  const P = Number(property.financedAmount) || 0;
  const r = (Number(property.interestRate) || 0) / 100 / 12;
  const n = (Number(property.amortization) || 0) * 12;
  if (!P || !r || !n) {
    return { payment: 0, balance: P, balanceAfterYear: P };
  }
  const payment = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  const start = property.loanStartDate ? new Date(property.loanStartDate) : new Date();
  const now = new Date();
  const monthsElapsed = Math.min(
    Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30.4375)),
    n,
  );
  const balance =
    P * Math.pow(1 + r, monthsElapsed) -
    payment * (Math.pow(1 + r, monthsElapsed) - 1) / r;
  const monthsYear = Math.min(12, n);
  const balanceAfterYear =
    P * Math.pow(1 + r, monthsYear) -
    payment * (Math.pow(1 + r, monthsYear) - 1) / r;
  return { payment, balance, balanceAfterYear };
}

const PortfolioPropertyReport = ({ property, onClose }) => {
  const reportRef = useRef(null);
  if (!property) return null;

  const baseAnalysis = useMemo(
    () => calculateRentability(property, false),
    [property],
  );

  const { payment, balance, balanceAfterYear } = calculateMortgage(property);
  const annualDebtService = payment * 12;
  const netIncome =
    (Number(property.annualRent) || 0) - (Number(property.annualExpenses) || 0);
  const cashflow = netIncome - annualDebtService;
  const equity = (Number(property.purchasePrice) || 0) - balance;
  const principalYear = (Number(property.financedAmount) || 0) - balanceAfterYear;
  const coc = equity ? (cashflow / equity) * 100 : 0;
  const loanCapReturn = equity ? (principalYear / equity) * 100 : 0;
  const valueGenerated = cashflow + principalYear;
  const globalReturn = equity ? (valueGenerated / equity) * 100 : 0;
  const ltv = (Number(property.purchasePrice) || 0)
    ? (balance / Number(property.purchasePrice)) * 100
    : 0;

  const analysis = {
    ...baseAnalysis,
    monthlyPayment: payment,
    annualDebtService,
    cashFlow: cashflow,
    loanPaydownReturn: loanCapReturn,
    cashOnCashReturn: coc,
    valueGeneratedYear1: valueGenerated,
    totalReturn: globalReturn,
    loanValueRatio: ltv,
    downPayment: equity,
    totalLoanAmount: balance,
  };

  const future = useMemo(
    () => calculateReturnAfterYears(property, analysis, 5, 0.02, 0.025, 0.03),
    [property, analysis],
  );

  const fullAddress = [
    property.address,
    property.city,
    property.province,
    property.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const handleGeneratePDF = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=600');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Rapport</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <div ref={reportRef} className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">
              Rapport d'Analyse de Rentabilité
            </h3>
            <p className="text-sm text-gray-600">
              {fullAddress}
            </p>
            <p className="text-sm text-gray-600">
              {property.numberOfUnits} unités • Revenus :
              {' '}
              {formatCurrency(property.annualRent)} • Dépenses :
              {' '}
              {formatCurrency(property.annualExpenses)}
            </p>
          </div>

          <KeyIndicators
            analysis={analysis}
            variant={
              property.financingType === 'private' ? 'private' : 'acquisition'
            }
          />

          <div className="grid md:grid-cols-2 gap-8">
            <FinancialSummary analysis={analysis} />
            <FinancingSummary
              analysis={analysis}
              currentProperty={property}
              financing={property}
              scenarioType="renewal"
            />
          </div>

          <div className="bg-white rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-2">
              Rendements futurs (5 ans)
            </h4>
            <p className="text-sm text-gray-700">
              Valeur totale : {formatCurrency(future.totalReturn)} • Rendement
              annualisé : {formatPercent(future.annualizedReturn)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Générer PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPropertyReport;

