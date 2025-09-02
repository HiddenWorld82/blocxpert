// components/PropertyReport.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { getScenarios } from '../services/dataService';
import { getAphMaxLtvRatio } from '../utils/cmhc';

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
  const [subScenarios, setSubScenarios] = useState([]);
  const [selectedSubScenarioId, setSelectedSubScenarioId] = useState('');
  const selectedSubScenario = useMemo(
    () => subScenarios.find((s) => s.id === selectedSubScenarioId),
    [subScenarios, selectedSubScenarioId]
  );
  const subScenarioAnalysis = useMemo(() => {
    if (!selectedSubScenario) return null;
    if (selectedSubScenario.type === 'refinancing') {
      const years = parseFloat(selectedSubScenario.refinanceYears) || 0;
      const revenueFactor = Math.pow(
        1 + (parseFloat(selectedSubScenario.revenueGrowthPct) || 0) / 100,
        years,
      );
      const expenseFactor = Math.pow(
        1 + (parseFloat(selectedSubScenario.expenseGrowthPct) || 0) / 100,
        years,
      );
      const appreciationPct =
        (parseFloat(selectedSubScenario.valueAppreciationPct) || 0) / 100;
      const purchasePrice = parseFloat(currentProperty.purchasePrice) || 0;
      const marketValue =
        parseFloat(selectedSubScenario.marketValue) ||
        purchasePrice * Math.pow(1 + appreciationPct, years);

      const revenueFields = [
        'annualRent',
        'parkingRevenue',
        'internetRevenue',
        'storageRevenue',
        'otherRevenue',
      ];
      const expenseFields = [
        'municipalTaxes',
        'schoolTaxes',
        'insurance',
        'electricityHeating',
        'maintenance',
        'concierge',
        'operatingExpenses',
        'otherExpenses',
        'heating',
        'electricity',
        'landscaping',
        'snowRemoval',
        'extermination',
        'fireInspection',
        'advertising',
        'legal',
        'accounting',
        'elevator',
        'cableInternet',
        'appliances',
        'garbage',
        'washerDryer',
        'hotWater',
      ];
      const acquisitionCostFields = [
        'inspection',
        'environmental1',
        'environmental2',
        'environmental3',
        'otherFees',
        'appraiser',
        'notary',
        'renovations',
        'cmhcAnalysis',
        'cmhcTax',
        'welcomeTax',
        'expertises',
      ];
      const baseProp = { ...currentProperty };
      acquisitionCostFields.forEach((f) => delete baseProp[f]);
      const scaled = {};
      revenueFields.forEach((f) => {
        const val = parseFloat(baseProp[f]);
        if (!isNaN(val)) scaled[f] = val * revenueFactor;
      });
      expenseFields.forEach((f) => {
        const val = parseFloat(baseProp[f]);
        if (!isNaN(val)) scaled[f] = val * expenseFactor;
      });
      const scenarioProperty = {
        ...baseProp,
        ...scaled,
        purchasePrice: marketValue,
        ...selectedSubScenario.financing,
        ...selectedSubScenario.financingFees,
        ignoreLTV: true,
      };

      let initialLoanAmount = 0;
      const principal = reportAnalysis?.maxLoanAmount || 0;
      if (['cmhc', 'cmhc_aph'].includes(currentProperty.financingType)) {
        const ltvRatio = purchasePrice > 0 ? (principal / purchasePrice) * 100 : 0;
        const points = parseInt(currentProperty.aphPoints) || 0;
        const effectiveLtv =
          currentProperty.financingType === 'cmhc_aph'
            ? Math.min(ltvRatio, getAphMaxLtvRatio(points) * 100)
            : ltvRatio;
        let premiumRate = 0;
        if (currentProperty.financingType === 'cmhc_aph' && effectiveLtv > 85) {
          premiumRate = effectiveLtv <= 90 ? 0.059 : 0.0615;
        } else {
          const brackets = [
            { ltv: 65, rate: 0.026 },
            { ltv: 70, rate: 0.0285 },
            { ltv: 75, rate: 0.0335 },
            { ltv: 80, rate: 0.0435 },
            { ltv: 85, rate: 0.0535 },
          ];
          const b = brackets.find((br) => effectiveLtv <= br.ltv);
          premiumRate = b?.rate || brackets.at(-1).rate;
        }
        const amortYears = parseInt(currentProperty.amortization) || 25;
        if (amortYears > 25) {
          premiumRate += ((amortYears - 25) / 5) * 0.0025;
        }
        if (currentProperty.financingType === 'cmhc_aph') {
          const rebate =
            points >= 100 ? 0.3 : points >= 70 ? 0.2 : points >= 50 ? 0.1 : 0;
          premiumRate *= 1 - rebate;
        }
        const premium = principal * premiumRate;
        const totalLoanAmount = principal + premium;
        const mortgageRate = (parseFloat(currentProperty.mortgageRate) || 0) / 100;
        let monthlyRate =
          currentProperty.financingType === 'private'
            ? mortgageRate / 12
            : Math.pow(1 + mortgageRate / 2, 1 / 6) - 1;
        const totalPayments = amortYears * 12;
        const paymentsMade = Math.min(years * 12, totalPayments);
        if (monthlyRate > 0) {
          const balance =
            totalLoanAmount *
            (Math.pow(1 + monthlyRate, totalPayments) -
              Math.pow(1 + monthlyRate, paymentsMade)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);
          const factor = balance / totalLoanAmount;
          initialLoanAmount = principal * factor;
        } else {
          initialLoanAmount = principal;
        }
      }
      return calculateRentability(scenarioProperty, advancedExpenses, {
        initialLoanAmount,
      });
    } else if (selectedSubScenario.type === 'optimization') {
      const scenarioProperty = {
        ...currentProperty,
        ...selectedSubScenario.revenue,
        ...selectedSubScenario.operatingExpenses,
      };
      return calculateRentability(scenarioProperty, advancedExpenses);
    }
    return null;
  }, [
    selectedSubScenario,
    currentProperty,
    reportAnalysis,
    advancedExpenses,
  ]);
  const [showIRRInfo, setShowIRRInfo] = useState(false);
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
        selectedSubScenario,
        subScenarioAnalysis,
      ),
    [
      reportProperty,
      reportAnalysis,
      returnYears,
      incomeGrowth,
      expenseGrowth,
      valueGrowth,
      selectedSubScenario,
      subScenarioAnalysis,
    ],
  );

  const [editingScenario, setEditingScenario] = useState(null);

  const reportRef = useRef(null);

  const baseScenarioId = scenario ? scenario.parentScenarioId || scenario.id : null;

  useEffect(() => {
    if (!currentProperty?.id || !baseScenarioId) return;
    const unsub = getScenarios(
      currentProperty.id,
      (scs) =>
        setSubScenarios(
          scs.filter((s) => ['refinancing', 'optimization'].includes(s.type))
        ),
      baseScenarioId,
    );
    return () => unsub && unsub();
  }, [currentProperty?.id, baseScenarioId]);

  useEffect(() => {
    if (!selectedSubScenario) return;
    if (selectedSubScenario.type === 'refinancing') {
      setIncomeGrowth(parseFloat(selectedSubScenario.revenueGrowthPct) || 0);
      setExpenseGrowth(parseFloat(selectedSubScenario.expenseGrowthPct) || 0);
      setValueGrowth(parseFloat(selectedSubScenario.valueAppreciationPct) || 0);
    } else if (selectedSubScenario.type === 'optimization') {
      setIncomeGrowth(null);
      setExpenseGrowth(null);
      setValueGrowth(null);
    }
  }, [selectedSubScenario]);

  const isRefinancing = selectedSubScenario?.type === 'refinancing';
  const isOptimization = selectedSubScenario?.type === 'optimization';

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
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={reportAnalysis} advancedExpenses={advancedExpenses} />
            <FinancingSummary
              analysis={reportAnalysis}
              currentProperty={reportProperty}
              scenarioType="initialFinancing"
            />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-1">Rendements futurs</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ajustez les hypothèses pour estimer les rendements après {returnYears} ans.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Sous-scénario</label>
              <select
                value={selectedSubScenarioId}
                onChange={(e) => setSelectedSubScenarioId(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="">Aucun</option>
                {subScenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || 'Sans titre'}{' '}
                    {s.type === 'refinancing' ? '(Refinancement)' : '(Optimisation)'}
                  </option>
                ))}
              </select>
            </div>
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
                <label className="block text-xs text-gray-500 mb-1">Croissance des revenus (%)</label>
                {isOptimization ? (
                  <input
                    type="text"
                    disabled
                    value="S/O"
                    className="w-full px-2 py-1 border rounded bg-gray-100 text-center"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={incomeGrowth ?? ''}
                    onChange={(e) =>
                      setIncomeGrowth(parseFloat(e.target.value) || 0)
                    }
                    disabled={isRefinancing}
                    className="w-full px-2 py-1 border rounded"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Croissance des dépenses (%)</label>
                {isOptimization ? (
                  <input
                    type="text"
                    disabled
                    value="S/O"
                    className="w-full px-2 py-1 border rounded bg-gray-100 text-center"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={expenseGrowth ?? ''}
                    onChange={(e) =>
                      setExpenseGrowth(parseFloat(e.target.value) || 0)
                    }
                    disabled={isRefinancing}
                    className="w-full px-2 py-1 border rounded"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Appréciation de la valeur (%)</label>
                {isOptimization ? (
                  <input
                    type="text"
                    disabled
                    value="S/O"
                    className="w-full px-2 py-1 border rounded bg-gray-100 text-center"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={valueGrowth ?? ''}
                    onChange={(e) =>
                      setValueGrowth(parseFloat(e.target.value) || 0)
                    }
                    disabled={isRefinancing}
                    className="w-full px-2 py-1 border rounded"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Rendement global sur {returnYears} an(s)</p>
                <p className="font-semibold">{formatPercent(multiYearReturn)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Rendement annualisé</p>
                <p className="font-semibold">{formatPercent(multiYearAnnualized)}</p>
              </div>
              <div className="text-center relative">
                <button
                  type="button"
                  onClick={() => setShowIRRInfo(!showIRRInfo)}
                  className="text-sm text-gray-500 underline cursor-pointer"
                >
                  TRI à la {returnYears}e année
                </button>
                {showIRRInfo && (
                  <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white border rounded shadow-lg text-xs text-gray-700">
                    Le taux de rendement interne (TRI) est le taux d'actualisation qui rend la valeur actuelle nette de l'investissement nulle.
                  </div>
                )}
                <p className="font-semibold">{formatPercent(multiYearIRR)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() =>
                onViewAmortization(
                  { ...reportProperty, appreciationRate: valueGrowth / 100 },
                  reportAnalysis,
                  selectedSubScenario,
                  subScenarioAnalysis,
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
