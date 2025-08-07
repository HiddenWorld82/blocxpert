// components/PropertyForm.jsx
import React from 'react';
import FinancingSection from './sections/FinancingSection';
import AcquisitionCosts from './sections/AcquisitionCosts';
import BasicInfo from './sections/BasicInfo';
import RevenueSection from './sections/RevenueSection';

const PropertyForm = ({
  currentProperty,
  setCurrentProperty,
  lockedFields,
  setLockedFields,
  setCurrentStep,
  analysis
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Nouvelle Analyse d'Immeuble</h2>
            <button
              onClick={() => setCurrentStep('home')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Retour
            </button>
          </div>

          <div className="space-y-8">
            <BasicInfo property={currentProperty} onChange={setCurrentProperty} />
            <RevenueSection revenue={currentProperty} onChange={setCurrentProperty} />
            <FinancingSection
              financing={currentProperty}
              onChange={setCurrentProperty}
              lockedFields={lockedFields}
              setLockedFields={setLockedFields}
              analysis={analysis}
            />
            <AcquisitionCosts
              costs={currentProperty}
              onChange={setCurrentProperty}
              lockedFields={lockedFields}
              analysis={analysis}
            />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('home')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => setCurrentStep('report')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Générer l'analyse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;