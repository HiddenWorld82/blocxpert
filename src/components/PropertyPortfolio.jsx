import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import PortfolioPropertyForm from './PortfolioPropertyForm';
import PortfolioPropertyReport from './PortfolioPropertyReport';

const PropertyPortfolio = () => {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('propertyPortfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [reportProperty, setReportProperty] = useState(null);

  useEffect(() => {
    localStorage.setItem('propertyPortfolio', JSON.stringify(properties));
  }, [properties]);

  const handleAdd = (data) => {
    setProperties((prev) => [...prev, { id: Date.now(), ...data }]);
  };

  const removeProperty = (id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Mon Parc Immobilier</h2>
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700 transition-colors"
      >
        <Plus className="inline-block mr-1" /> Ajouter
      </button>
      {properties.length > 0 && (
        <ul className="space-y-4">
          {properties.map((p) => (
            <li
              key={p.id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold">{p.name}</h3>
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
      {showForm && (
        <PortfolioPropertyForm
          onSave={(data) => {
            handleAdd(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {reportProperty && (
        <PortfolioPropertyReport
          property={reportProperty}
          onClose={() => setReportProperty(null)}
        />
      )}
    </div>
  );
};

export default PropertyPortfolio;
