import React, { useMemo } from 'react';
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
  const payment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const start = property.loanStartDate ? new Date(property.loanStartDate) : new Date();
  const now = new Date();
  const monthsElapsed = Math.min(Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30.4375)), n);
  const balance = P * Math.pow(1 + r, monthsElapsed) - payment * (Math.pow(1 + r, monthsElapsed) - 1) / r;
  const monthsYear = Math.min(12, n);
  const balanceAfterYear = P * Math.pow(1 + r, monthsYear) - payment * (Math.pow(1 + r, monthsYear) - 1) / r;
  return { payment, balance, balanceAfterYear };
}

const PortfolioPropertyReport = ({ property, onClose }) => {
  if (!property) return null;

  const analysis = useMemo(() => calculateRentability(property, false), [property]);
  const { payment, balance, balanceAfterYear } = calculateMortgage(property);
  const annualDebtService = payment * 12;
  const netIncome = (Number(property.annualRent) || 0) - (Number(property.annualExpenses) || 0);
  const cashflow = netIncome - annualDebtService;
  const equity = (Number(property.purchasePrice) || 0) - balance;
  const principalYear = (Number(property.financedAmount) || 0) - balanceAfterYear;
  const coc = equity ? (cashflow / equity) * 100 : 0;
  const loanCapReturn = equity ? (principalYear / equity) * 100 : 0;
  const valueGenerated = cashflow + principalYear;
  const globalReturn = equity ? (valueGenerated / equity) * 100 : 0;
  const ltv = (Number(property.purchasePrice) || 0) ? (balance / Number(property.purchasePrice)) * 100 : 0;

  const future = useMemo(() =>
    calculateReturnAfterYears(property, analysis, 5, 0.02, 0.025, 0.03),
  [property, analysis]);

  const fullAddress = [property.address, property.city, property.province, property.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl space-y-4">
        <h3 className="text-xl font-semibold">Rapport d'Analyse de Rentabilité</h3>
        <div className="text-sm space-y-1">
          <p>{fullAddress} - {property.numberOfUnits} unités - {formatCurrency(property.annualRent)} revenus - {formatCurrency(property.annualExpenses)} dépenses</p>
          <p>{property.financingType || 'Financement'} - Solde du prêt {formatCurrency(balance)} - Service de la dette {formatCurrency(annualDebtService)} - Cashflow annuel {formatCurrency(cashflow)}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-1">KPI</h4>
          <p className="text-sm">Rendement Cash on Cash: {formatPercent(coc)} - Rendement capitalisation du prêt (1 an): {formatPercent(loanCapReturn)} - Rendement sur la plus value: {formatPercent(0)}</p>
          <p className="text-sm">Valeur générée dans la prochaine année: {formatCurrency(valueGenerated)} - Rendement global 1 an: {formatPercent(globalReturn)} - Ratio Prêt-Valeur: {formatPercent(ltv)}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Résumé du financement</h4>
          <p className="text-sm">Valeur de l'immeuble: {formatCurrency(property.purchasePrice)} - Solde du prêt: {formatCurrency(balance)} - Équité figée: {formatCurrency(equity)} - Paiements mensuels: {formatCurrency(payment)}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Rendements futurs (5 ans)</h4>
          <p className="text-sm">Valeur totale: {formatCurrency(future.totalReturn)} - Rendement annualisé: {formatPercent(future.annualizedReturn)}</p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 border rounded">Amortissement</button>
          <button className="px-4 py-2 border rounded">Nouveau Scénario</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Générer PDF</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPropertyReport;
