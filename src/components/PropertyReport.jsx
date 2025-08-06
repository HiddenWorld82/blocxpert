// components/PropertyReport.jsx
import React from 'react';
import KeyIndicators from './sections/KeyIndicators';
import FinancialSummary from './sections/FinancialSummary';
import FinancingSummary from './sections/FinancingSummary';
import Recommendations from './sections/Recommendations';
import ExecutiveSummary from './sections/ExecutiveSummary';

const PropertyReport = ({ currentProperty, setCurrentStep, analysis, onSave }) => {
  const isPositiveCashFlow = analysis.cashFlow >= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Rapport d'Analyse de Rentabilité</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep('form')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Modifier
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {currentProperty.address || 'Propriété à analyser'}
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Prix d'achat:</span>
                <div className="font-semibold">
                  {Number(currentProperty.purchasePrice || 0).toLocaleString('fr-CA')}$
                </div>
              </div>
              <div>
                <span className="text-gray-600">Nombre d'unités:</span>
                <div className="font-semibold">{currentProperty.numberOfUnits || 'N/A'}</div>
              </div>
              <div>
                <span className="text-gray-600">Prix par porte:</span>
                <div className="font-semibold">
                  {Math.round(analysis.pricePerUnit).toLocaleString('fr-CA')}$
                </div>
              </div>
              <div>
                <span className="text-gray-600">Financement:</span>
                <div className="font-semibold">
                  {currentProperty.financingType === 'conventional' && 'Conventionnel'}
                  {currentProperty.financingType === 'cmhc' && 'SCHL'}
                  {currentProperty.financingType === 'cmhc_aph' &&
                    `SCHL APH (${currentProperty.aphPoints} pts)`}
                </div>
              </div>
            </div>
          </div>

          <KeyIndicators analysis={analysis} />
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={analysis} />
            <FinancingSummary analysis={analysis} currentProperty={currentProperty} />
          </div>

          <Recommendations
            analysis={analysis}
            currentProperty={currentProperty}
          />
          <ExecutiveSummary
            analysis={analysis}
            currentProperty={currentProperty}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyReport;
