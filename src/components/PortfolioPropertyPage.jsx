import React, { useState } from 'react';
import BasicInfo from './sections/BasicInfo';
import RevenueSection from './sections/RevenueSection';
import OperatingExpensesSection from './sections/OperatingExpensesSection';
import CurrentFinancingSection from './sections/CurrentFinancingSection';
import defaultProperty from '../defaults/defaultProperty';
import calculateRentability from '../utils/calculateRentability';

const PortfolioPropertyPage = ({ onSave, onCancel, initialData = {} }) => {
  const [property, setProperty] = useState({ ...defaultProperty, ...initialData });
  const [advanced, setAdvanced] = useState(false);

  const handleSave = () => {
    const analysis = calculateRentability(property, advanced);
    onSave({
      ...property,
      advancedExpenses: advanced,
      annualRent: Number(property.annualRent) || 0,
      annualExpenses: analysis.totalExpenses,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Nouvel immeuble</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAdvanced(!advanced)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {advanced ? 'Mode simplifié' : 'Mode avancé'}
              </button>
              <button onClick={onCancel} className="text-gray-600 hover:text-gray-800">
                ← Retour
              </button>
            </div>
          </div>
          <div className="space-y-8">
            <BasicInfo
              property={property}
              onChange={setProperty}
              advancedExpenses={advanced}
              purchasePriceLabel="Valeur de l'immeuble"
            />
            <RevenueSection
              revenue={property}
              onChange={setProperty}
              advancedExpenses={advanced}
            />
            <OperatingExpensesSection
              expenses={property}
              onChange={setProperty}
              advancedExpenses={advanced}
            />
            <CurrentFinancingSection
              financing={property}
              onChange={setProperty}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPropertyPage;
