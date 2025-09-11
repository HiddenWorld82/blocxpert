import React, { useMemo, useRef, useState } from 'react';
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
    () => calculateRentability(property, property.advancedExpenses),
    [property],
  );

  const { payment, balance, balanceAfterYear } = calculateMortgage(property);
  const annualDebtService = payment * 12;
  const netIncome = baseAnalysis.effectiveNetIncome;
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

  const averageRentPerDoor =
    ((Number(property.annualRent) || 0) /
      (Number(property.numberOfUnits) || 1)) /
    12;

  const [returnYears, setReturnYears] = useState(5);
  const [incomeGrowth, setIncomeGrowth] = useState(2);
  const [expenseGrowth, setExpenseGrowth] = useState(2.5);
  const [valueGrowth, setValueGrowth] = useState(3);
  const [showIRRInfo, setShowIRRInfo] = useState(false);
  const {
    totalReturn: multiYearReturn,
    annualizedReturn: multiYearAnnualized,
    internalRateOfReturn: multiYearIRR,
  } = useMemo(
    () =>
      calculateReturnAfterYears(
        property,
        analysis,
        returnYears,
        incomeGrowth / 100,
        expenseGrowth / 100,
        valueGrowth / 100,
      ),
    [
      property,
      analysis,
      returnYears,
      incomeGrowth,
      expenseGrowth,
      valueGrowth,
    ],
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
    const printWindow = window.open('', '', 'height=800,width=600');
    if (!printWindow) return;

    // Copy style and link tags so the PDF keeps the app styling
    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((el) => el.outerHTML)
      .join('');

    printWindow.document.write('<html><head><title>Rapport</title>');
    printWindow.document.write(styles);
    printWindow.document.write('</head><body class="p-4">');
    printWindow.document.write(reportRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div
          ref={reportRef}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Rapport d'Analyse de Rentabilité</h2>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour
              </button>
              <button
                onClick={handleGeneratePDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Générer PDF
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {fullAddress || 'Propriété à analyser'}
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-600">Valeur estimée de l'immeuble:</span>
                    <div className="font-semibold">
                      {formatCurrency(Number(property.purchasePrice) || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Nb d'unités:</span>
                    <div className="font-semibold">
                      {property.numberOfUnits || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Prix par porte:</span>
                    <div className="font-semibold">
                      {formatCurrency(Math.round(analysis.pricePerUnit || 0))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Loyer moyen par porte:</span>
                    <div className="font-semibold">
                      {formatCurrency(averageRentPerDoor)}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {property.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {property.financingType === 'conventional' && 'Conventionnel'}
                        {property.financingType === 'cmhc' && 'SCHL'}
                        {property.financingType === 'cmhc_aph' && 'SCHL APH Select'}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Solde du prêt:</span>
                    <div className="font-semibold">
                      {formatCurrency(analysis.maxLoanAmount)}
                    </div>
                  </div>
                  {property.financingType === 'private' && (
                    <div>
                      <span className="text-gray-600">Ratio prêt-valeur:</span>
                      <div className="font-semibold">
                        {formatPercent(analysis.loanValueRatio)}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Service de la dette:</span>
                    <div className="font-semibold">
                      {formatCurrency(analysis.annualDebtService)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Cashflow:</span>
                    <div className="font-semibold">
                      {formatCurrency(analysis.cashFlow)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <KeyIndicators
            analysis={analysis}
            variant={
              property.financingType === 'private' ? 'private' : 'acquisition'
            }
            exclude={['mrb', 'mrn', 'tga']}
          />

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={analysis} />
            <FinancingSummary
              analysis={analysis}
              currentProperty={property}
              financing={property}
              scenarioType="renewal"
            />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-1">Rendements futurs</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ajustez les hypothèses pour estimer les rendements après {returnYears} ans.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Années</label>
                <input
                  type="number"
                  min="1"
                  value={returnYears}
                  onChange={(e) => setReturnYears(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Croissance des revenus (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={incomeGrowth}
                  onChange={(e) =>
                    setIncomeGrowth(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Croissance des dépenses (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={expenseGrowth}
                  onChange={(e) =>
                    setExpenseGrowth(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Appréciation de la valeur (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={valueGrowth}
                  onChange={(e) =>
                    setValueGrowth(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Rendement global sur {returnYears} an(s)
                </p>
                <p className="font-semibold">
                  {formatPercent(multiYearReturn)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Rendement annualisé</p>
                <p className="font-semibold">
                  {formatPercent(multiYearAnnualized)}
                </p>
              </div>
              <div className="text-center relative">
                <button
                  type="button"
                  onClick={() => setShowIRRInfo(!showIRRInfo)}
                  className="text-sm text-gray-500 underline cursor-pointer"
                >
                  TRI à la {returnYears}e année
                </button>
                {showIRRInfo && (
                  <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white border rounded shadow-lg text-xs text-gray-700">
                    Le taux de rendement interne (TRI) est le taux d'actualisation qui rend la valeur actuelle nette de l'investissement nulle.
                  </div>
                )}
                <p className="font-semibold">
                  {formatPercent(multiYearIRR)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPropertyReport;

