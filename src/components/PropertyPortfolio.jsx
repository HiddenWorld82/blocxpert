import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import PortfolioPropertyPage from './PortfolioPropertyPage';
import PortfolioPropertyReport from './PortfolioPropertyReport';
import calculateRentability from '../utils/calculateRentability';

const PropertyPortfolio = () => {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('propertyPortfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('list');
  const [reportProperty, setReportProperty] = useState(null);

  useEffect(() => {
    localStorage.setItem('propertyPortfolio', JSON.stringify(properties));
  }, [properties]);

  const handleAdd = (data) => {
    const analysis = calculateRentability(data, data.advancedExpenses);
    const cleaned = {
      ...data,
      annualRent: Number(data.annualRent) || 0,
      annualExpenses: Number(data.annualExpenses ?? analysis.totalExpenses) || 0,
      financedAmount: Number(data.financedAmount) || 0,
      interestRate: Number(data.interestRate) || 0,
      amortization: Number(data.amortization) || 0,
    };
    setProperties((prev) => [...prev, { id: Date.now(), ...cleaned }]);
  };

  const removeProperty = (id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  if (view === 'form') {
    return (
      <PortfolioPropertyPage
        onSave={(data) => {
          handleAdd(data);
          setView('list');
        }}
        onCancel={() => setView('list')}
      />
    );
  }

  if (reportProperty) {
    return (
      <PortfolioPropertyReport
        property={reportProperty}
        onClose={() => setReportProperty(null)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Mon Parc Immobilier</h2>
        <button
          onClick={() => setView('form')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="inline-block mr-1" /> Ajouter
        </button>
      </div>
      {properties.length > 0 && (
        <ul className="space-y-4">
          {properties.map((p) => (
            <li
              key={p.id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold">{p.name || p.address}</h3>
                <p className="text-sm text-gray-600">
                  Revenus: {p.annualRent.toLocaleString('fr-CA')} $ • Dépenses: {p.annualExpenses.toLocaleString('fr-CA')} $
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setReportProperty(p)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label="Rapport"
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => removeProperty(p.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PropertyPortfolio;
