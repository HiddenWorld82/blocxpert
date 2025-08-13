// components/PropertyReport.jsx
import React, { useState, useMemo } from 'react';
import KeyIndicators from './sections/KeyIndicators';
import FinancialSummary from './sections/FinancialSummary';
import FinancingSummary from './sections/FinancingSummary';
import Recommendations from './sections/Recommendations';
import ExecutiveSummary from './sections/ExecutiveSummary';
import ScenarioList from './ScenarioList';
import FinancingScenarioForm from './FinancingScenarioForm';
import RefinancingScenarioForm from './RefinancingScenarioForm';
import RenovationScenarioForm from './RenovationScenarioForm';
import calculateRentability from '../utils/calculateRentability';

const PropertyReport = ({ currentProperty, setCurrentStep, analysis: baseAnalysis, onSave, advancedExpenses, scenario }) => {
  //const numberFormatter = new Intl.NumberFormat('fr-CA');
  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const reportProperty = useMemo(
    () =>
      scenario
        ? { ...currentProperty, ...scenario.financing, ...scenario.acquisitionCosts }
        : currentProperty,
    [currentProperty, scenario]
  );

  const reportAnalysis = useMemo(
    () =>
      scenario
        ? calculateRentability(reportProperty, advancedExpenses)
        : baseAnalysis,
    [scenario, reportProperty, advancedExpenses, baseAnalysis]
  );

  const averageRentPerDoor =
    ((parseFloat(reportProperty.annualRent) || 0) /
      (parseInt(reportProperty.numberOfUnits) || 1)) /
    12;

  const [editingScenario, setEditingScenario] = useState(null);

  const renderScenarioForm = () => {
    if (!editingScenario) return null;
    const formProps = {
      propertyId: currentProperty.id,
      property: currentProperty,
      advancedExpenses,
      onSaved: () => setEditingScenario(null),
      initialScenario: editingScenario.id ? editingScenario : undefined,
    };
    switch (editingScenario.type) {
      case 'refinancing':
        return <RefinancingScenarioForm {...formProps} />;
      case 'renovation':
        return <RenovationScenarioForm {...formProps} />;
      default:
        return (
          <FinancingScenarioForm
            {...formProps}
            type={editingScenario.type || 'initialFinancing'}
          />
        );
    }
  };

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
              {reportProperty.address || 'Propriété à analyser'}
            </h3>
            {advancedExpenses ? (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Prix demandé:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(reportProperty.askingPrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix d'achat:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(reportProperty.purchasePrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nb d'unités:</span>
                      <div className="font-semibold">{reportProperty.numberOfUnits || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix par porte:</span>
                      <div className="font-semibold">
                        {formatMoney(Math.round(reportAnalysis.pricePerUnit || 0))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Revenus totaux:</span>
                      <div className="font-semibold">
                        {formatMoney(reportAnalysis.totalGrossRevenue)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Dépenses totales:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(reportAnalysis.totalExpenses)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Service de la dette an 1:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(reportAnalysis.annualDebtService)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Cash Flow:</span>
                      <div className={`font-semibold ${reportAnalysis.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(reportAnalysis.cashFlow)}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {reportProperty.financingType === 'conventional' && 'Conventionnel'}
                        {reportProperty.financingType === 'cmhc' && 'SCHL'}
                        {reportProperty.financingType === 'cmhc_aph' && `SCHL APH (${reportProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prêt maximal:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Mise de fonds:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.downPayment)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Investissement total:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.totalInvestment)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Prix d'achat:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(reportProperty.purchasePrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nom d'unités:</span>
                      <div className="font-semibold">{reportProperty.numberOfUnits || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix par porte:</span>
                      <div className="font-semibold">
                        {formatMoney(Math.round(reportAnalysis.pricePerUnit || 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Loyer moyen par porte:</span>
                      <div className="font-semibold">{formatMoney(averageRentPerDoor)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {reportProperty.financingType === 'conventional' && 'Conventionnel'}
                        {reportProperty.financingType === 'cmhc' && 'SCHL'}
                        {reportProperty.financingType === 'cmhc_aph' && `SCHL APH (${reportProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prêt maximal:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Mise de fonds:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.downPayment)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Investissement total:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.totalInvestment)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <KeyIndicators analysis={reportAnalysis} />

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={reportAnalysis} advancedExpenses={advancedExpenses} />
            <FinancingSummary analysis={reportAnalysis} currentProperty={reportProperty} />
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setCurrentStep('amortization')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Amortissement
            </button>
            <button
              onClick={() => setEditingScenario({ type: 'refinancing' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Nouveau scénario
            </button>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
            >
              Bouton 3
            </button>
          </div>

          <div className="mb-8">
            <ScenarioList
              propertyId={currentProperty.id}
              onEdit={(sc) => setEditingScenario(sc)}
              excludeTypes={['initialFinancing']}
            />
          </div>

          {renderScenarioForm()}

          <Recommendations
            analysis={reportAnalysis}
            currentProperty={reportProperty}
          />

          <ExecutiveSummary
            analysis={reportAnalysis}
            currentProperty={reportProperty}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyReport;
