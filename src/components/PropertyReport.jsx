// components/PropertyReport.jsx
import React from 'react';
import KeyIndicators from './sections/KeyIndicators';
import FinancialSummary from './sections/FinancialSummary';
import FinancingSummary from './sections/FinancingSummary';
import Recommendations from './sections/Recommendations';
import ExecutiveSummary from './sections/ExecutiveSummary';

const PropertyReport = ({ currentProperty, setCurrentStep, analysis, onSave, advancedExpenses }) => {
  const numberFormatter = new Intl.NumberFormat('fr-CA');
  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const averageRentPerDoor =
    ((parseFloat(currentProperty.annualRent) || 0) /
      (parseInt(currentProperty.numberOfUnits) || 1)) /
    12;
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
            {advancedExpenses ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Analyse avancée</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Prix demandé:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(currentProperty.askingPrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix d'achat:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(currentProperty.purchasePrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nb d'unités:</span>
                      <div className="font-semibold">{currentProperty.numberOfUnits || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix par porte:</span>
                      <div className="font-semibold">
                        {formatMoney(Math.round(analysis.pricePerUnit || 0))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Revenus totaux:</span>
                      <div className="font-semibold">
                        {formatMoney(analysis.totalGrossRevenue)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Dépenses totales:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(analysis.totalExpenses)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Service de la dette an 1:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(analysis.annualDebtService)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Cash Flow:</span>
                      <div className={`font-semibold ${analysis.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(analysis.cashFlow)}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Financement</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {currentProperty.financingType === 'conventional' && 'Conventionnel'}
                        {currentProperty.financingType === 'cmhc' && 'SCHL'}
                        {currentProperty.financingType === 'cmhc_aph' && `SCHL APH (${currentProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prêt maximal:</span>
                      <div className="font-semibold">{formatMoney(analysis.maxLoanAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Mise de fonds:</span>
                      <div className="font-semibold">{formatMoney(analysis.downPayment)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Investissement total:</span>
                      <div className="font-semibold">{formatMoney(analysis.totalInvestment)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Analyse simple</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Prix d'achat:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(currentProperty.purchasePrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nom d'unités:</span>
                      <div className="font-semibold">{currentProperty.numberOfUnits || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix par porte:</span>
                      <div className="font-semibold">
                        {formatMoney(Math.round(analysis.pricePerUnit || 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Loyer moyen par porte:</span>
                      <div className="font-semibold">{formatMoney(averageRentPerDoor)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Financement</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {currentProperty.financingType === 'conventional' && 'Conventionnel'}
                        {currentProperty.financingType === 'cmhc' && 'SCHL'}
                        {currentProperty.financingType === 'cmhc_aph' && `SCHL APH (${currentProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prêt maximal:</span>
                      <div className="font-semibold">{formatMoney(analysis.maxLoanAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Mise de fonds:</span>
                      <div className="font-semibold">{formatMoney(analysis.downPayment)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Investissement total:</span>
                      <div className="font-semibold">{formatMoney(analysis.totalInvestment)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <KeyIndicators analysis={analysis} />
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={analysis} advancedExpenses={advancedExpenses} />
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
