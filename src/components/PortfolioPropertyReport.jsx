import React from 'react';

const PortfolioPropertyReport = ({ property, onClose }) => {
  if (!property) return null;

  const netIncome = property.annualRent - property.annualExpenses;
  const capRate = property.purchasePrice
    ? (netIncome / property.purchasePrice) * 100
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl space-y-4">
        <h3 className="text-xl font-semibold">Rapport - {property.name}</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Adresse:</span> {property.address}, {property.city}
          </p>
          <p>
            <span className="font-semibold">Prix d'achat:</span> {property.purchasePrice.toLocaleString('fr-CA')} $
          </p>
          <p>
            <span className="font-semibold">Revenus annuels:</span> {property.annualRent.toLocaleString('fr-CA')} $
          </p>
          <p>
            <span className="font-semibold">Dépenses annuelles:</span> {property.annualExpenses.toLocaleString('fr-CA')} $
          </p>
          <p>
            <span className="font-semibold">Revenu net:</span> {netIncome.toLocaleString('fr-CA')} $
          </p>
          <p>
            <span className="font-semibold">Taux de capitalisation:</span> {capRate.toFixed(2)}%
          </p>
          <p>
            <span className="font-semibold">Solde hypothécaire:</span> {property.mortgageBalance.toLocaleString('fr-CA')} $
          </p>
          <p>
            <span className="font-semibold">Échéance:</span> {property.dueDate || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Terme:</span> {property.term} ans à {property.rate}%
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPropertyReport;
