// components/PropertyReport.jsx
import React, { useState, useMemo, useRef } from 'react';
import KeyIndicators from './sections/KeyIndicators';
import FinancialSummary from './sections/FinancialSummary';
import FinancingSummary from './sections/FinancingSummary';
import Recommendations from './sections/Recommendations';
import ExecutiveSummary from './sections/ExecutiveSummary';
import ScenarioList from './ScenarioList';
import FutureScenarioForm from './FutureScenarioForm';
import RenewScenarioForm from './RenewScenarioForm';
import OptimisationScenarioForm from './OptimisationScenarioForm';
import calculateRentability from '../utils/calculateRentability';
import calculateReturnAfterYears from '../utils/calculateReturnAfterYears';

const PropertyReport = ({
  currentProperty,
  setCurrentStep,
  analysis: baseAnalysis,
  onSave,
  advancedExpenses,
  scenario,
  onViewAmortization,
}) => {
  //const numberFormatter = new Intl.NumberFormat('fr-CA');
  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatPercent = (value) =>
    `${new Intl.NumberFormat('fr-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)}%`;

  const reportProperty = useMemo(
    () =>
      scenario
        ? { ...currentProperty, ...scenario.financing, ...scenario.acquisitionCosts }
        : currentProperty,
    [currentProperty, scenario]
  );

  const fullAddress = [
    reportProperty.address,
    reportProperty.city,
    reportProperty.province,
    reportProperty.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

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

  const [returnYears, setReturnYears] = useState(5);
  const [incomeGrowth, setIncomeGrowth] = useState(2);
  const [expenseGrowth, setExpenseGrowth] = useState(2.5);
  const [valueGrowth, setValueGrowth] = useState(3);
  const {
    totalReturn: multiYearReturn,
    annualizedReturn: multiYearAnnualized,
    internalRateOfReturn: multiYearIRR,
  } = useMemo(
    () =>
      calculateReturnAfterYears(
        reportProperty,
        reportAnalysis,
        returnYears,
        incomeGrowth / 100,
        expenseGrowth / 100,
        valueGrowth / 100,
      ),
    [
      reportProperty,
      reportAnalysis,
      returnYears,
      incomeGrowth,
      expenseGrowth,
      valueGrowth,
    ],
  );

  const [editingScenario, setEditingScenario] = useState(null);

  const reportRef = useRef(null);

  const baseScenarioId = scenario ? scenario.parentScenarioId || scenario.id : null;

  const handleGeneratePDF = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=600');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Rapport</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };


  const renderScenarioForm = () => {
    if (!editingScenario) return null;
    if (!editingScenario.type) {
      return (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Choisir le type de scénario
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setEditingScenario({ ...editingScenario, type: 'refinancing' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refinancement
            </button>
            <button
              onClick={() => setEditingScenario({ ...editingScenario, type: 'renewal' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Renouvellement hypothécaire
            </button>
            <button
              onClick={() => setEditingScenario({ ...editingScenario, type: 'optimization' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Optimisation
            </button>
          </div>
        </div>
      );
    }
    const formProps = {
      propertyId: currentProperty.id,
      property: currentProperty,
      advancedExpenses,
      onSaved: () => setEditingScenario(null),
      initialScenario: editingScenario,
    };
    const formComponents = {
      refinancing: FutureScenarioForm,
      renewal: RenewScenarioForm,
      optimization: OptimisationScenarioForm,
    };
    const ScenarioFormComponent = formComponents[editingScenario.type];
    return <ScenarioFormComponent {...formProps} type={editingScenario.type} />;
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div ref={reportRef} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Rapport d'Analyse de Rentabilité</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep('scenario')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Modifier
              </button>
              {scenario ? (
                <button
                  onClick={() => setCurrentStep('dashboard')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Retour
                </button>
              ) : (
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Sauvegarder
                </button>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {fullAddress || 'Propriété à analyser'}
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
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Revenus totaux:</span>
                      <div className="font-semibold">
                        {formatMoney(reportAnalysis.totalGrossRevenue)}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Dépenses totales:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(reportAnalysis.totalExpenses)}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Service de la dette an 1:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(reportAnalysis.annualDebtService)}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Cash Flow:</span>
                      <div className={`font-semibold ${reportAnalysis.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(reportAnalysis.cashFlow)}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="grid md:grid-cols-4 gap-4">
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {reportProperty.financingType === 'conventional' && 'Conventionnel'}
                        {reportProperty.financingType === 'cmhc' && 'SCHL'}
                        {reportProperty.financingType === 'cmhc_aph' && `SCHL APH (${reportProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Prêt maximal:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    )}
                    {reportProperty.financingType === 'private' && (
                      <div>
                      <span className="text-gray-600">Prêt octroyé:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    )}
                    {reportProperty.financingType === 'private' && (
                      <div>
                        <span className="text-gray-600">Ratio prêt-valeur:</span>
                        <div className="font-semibold">{formatPercent(reportAnalysis.loanValueRatio)}</div>
                      </div>
                    )}
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
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">Financement:</span>
                      <div className="font-semibold">
                        {reportProperty.financingType === 'conventional' && 'Conventionnel'}
                        {reportProperty.financingType === 'cmhc' && 'SCHL'}
                        {reportProperty.financingType === 'cmhc_aph' && `SCHL APH (${reportProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    )}
                    <div>
                      <span className="text-gray-600">Prêt maximal:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    {reportProperty.financingType === 'private' && (
                      <div>
                        <span className="text-gray-600">Ratio prêt-valeur:</span>
                        <div className="font-semibold">{formatPercent(reportAnalysis.loanValueRatio)}</div>
                      </div>
                    )}
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

          <KeyIndicators
            analysis={reportAnalysis}
            variant={
              reportProperty.financingType === "private"
                ? "private"
                : "acquisition"
            }
          />

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rendement après {returnYears} années
            </label>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Années</label>
                <input
                  type="number"
                  min="1"
                  value={returnYears}
                  onChange={(e) => setReturnYears(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Augmentation revenus (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={incomeGrowth}
                  onChange={(e) => setIncomeGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Augmentation dépenses (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={expenseGrowth}
                  onChange={(e) => setExpenseGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Augmentation valeur (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={valueGrowth}
                  onChange={(e) => setValueGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Rendement global {returnYears} an(s)</p>
                <p className="font-semibold">{formatPercent(multiYearReturn)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Rendement annualisé</p>
                <p className="font-semibold">{formatPercent(multiYearAnnualized)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">TRI à la {returnYears}e année</p>
                <p className="font-semibold">{formatPercent(multiYearIRR)}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={reportAnalysis} advancedExpenses={advancedExpenses} />
            <FinancingSummary
              analysis={reportAnalysis}
              currentProperty={reportProperty}
              scenarioType="initialFinancing"
            />
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() =>
                onViewAmortization(
                  { ...reportProperty, appreciationRate: valueGrowth / 100 },
                  reportAnalysis,
                )
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Amortissement
            </button>
            <button
              onClick={() =>
                setEditingScenario({ parentScenarioId: baseScenarioId })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Nouveau scénario
            </button>
            <button
              onClick={handleGeneratePDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Générer PDF
            </button>
          </div>

          <div className="mb-8">
            <ScenarioList
              propertyId={currentProperty.id}
              onEdit={(sc) => setEditingScenario(sc)}
              excludeTypes={['initialFinancing']}
              parentScenarioId={baseScenarioId}
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
