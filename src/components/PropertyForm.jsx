// components/PropertyForm.jsx
import React from 'react';
import BasicInfo from './sections/BasicInfo';
import RevenueSection from './sections/RevenueSection';
import OperatingExpensesSection from './sections/OperatingExpensesSection';

const PropertyForm = ({
  currentProperty,
  setCurrentProperty,
  setCurrentStep,
  advancedExpenses,
  setAdvancedExpenses,
  onSave,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Nouvelle Analyse d'Immeuble</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAdvancedExpenses(!advancedExpenses)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {advancedExpenses ? 'Mode simplifié' : 'Mode avancé'}
              </button>
              <button
                onClick={() => setCurrentStep('home')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <BasicInfo
              property={currentProperty}
              onChange={setCurrentProperty}
              advancedExpenses={advancedExpenses}
            />
            <RevenueSection
              revenue={currentProperty}
              onChange={setCurrentProperty}
              advancedExpenses={advancedExpenses}
            />
            <OperatingExpensesSection
              expenses={currentProperty}
              onChange={setCurrentProperty}
              advancedExpenses={advancedExpenses}
            />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('home')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={onSave}
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

export default PropertyForm;
