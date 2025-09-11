// components/PropertyReport.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
  const typeLabels = {
    refinancing: t('scenario.refinancing'),
    renewal: t('scenario.renewal'),
    optimization: t('scenario.optimization'),
    other: t('scenario.other'),
  };
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

      let initialLoanAmount =
        parseFloat(selectedSubScenario.financing?.existingLoanBalance) || 0;
      const principal = reportAnalysis?.maxLoanAmount || 0;
      if (
        initialLoanAmount === 0 &&
        ['cmhc', 'cmhc_aph'].includes(currentProperty.financingType)
      ) {
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
          initialLoanAmount = balance;
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
    if (!currentProperty?.id) return;
    const unsub = getScenarios(currentProperty.id, (scs) => {
      const filtered = baseScenarioId
        ? scs.filter(
            (sc) => sc.parentScenarioId === baseScenarioId && sc.type !== 'renewal',
          )
        : scs.filter((sc) => sc.type !== 'renewal');
      setSubScenarios(filtered);
      setSelectedSubScenarioId((currentSelectedId) =>
        filtered.some((sc) => sc.id === currentSelectedId)
          ? currentSelectedId
          : '',
      );
    });
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

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;

    // Gather existing styles so Puppeteer applies the same styling
    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((el) => el.outerHTML)
      .join('');

    const html = `<!doctype html><html><head>${styles}</head><body class="p-4">${reportRef.current.innerHTML}</body></html>`;

    try {
      const pdfUrl = `${import.meta.env.VITE_PDF_URL || window.location.origin}/api/generate-pdf`;
      const response = await fetch(pdfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) throw new Error('Request failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rapport.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };


  const renderScenarioForm = () => {
    if (!editingScenario) return null;
    if (!editingScenario.type) {
      return (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            {t('propertyReport.chooseScenarioType')}
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setEditingScenario({ ...editingScenario, type: 'refinancing' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('scenario.refinancing')}
            </button>
            <button
              onClick={() => setEditingScenario({ ...editingScenario, type: 'renewal' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('scenario.renewal')}
            </button>
            <button
              onClick={() => setEditingScenario({ ...editingScenario, type: 'optimization' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('scenario.optimization')}
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
        <div
          ref={reportRef}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">{t('propertyReport.title')}</h2>
            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
              <button
                onClick={() => setCurrentStep('scenario')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('edit')}
              </button>
              {scenario ? (
                <button
                  onClick={() => setCurrentStep('dashboard')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← {t('back')}
                </button>
              ) : (
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('save')}
                </button>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {fullAddress || t('propertyReport.analyzingProperty')}
            </h3>
            {advancedExpenses ? (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">{t('propertyReport.askingPrice')}:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(reportProperty.askingPrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.purchasePrice')}:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(reportProperty.purchasePrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.numberOfUnits')}:</span>
                      <div className="font-semibold">{reportProperty.numberOfUnits || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.pricePerDoor')}:</span>
                      <div className="font-semibold">
                        {formatMoney(Math.round(reportAnalysis.pricePerUnit || 0))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.totalRevenue')}:</span>
                      <div className="font-semibold">
                        {formatMoney(reportAnalysis.totalGrossRevenue)}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.totalExpenses')}:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(reportAnalysis.totalExpenses)}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.debtServiceYear1')}:</span>
                      <div className="font-semibold text-red-600">
                        {formatMoney(reportAnalysis.annualDebtService)}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.cashFlow')}:</span>
                      <div className={`font-semibold ${reportAnalysis.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(reportAnalysis.cashFlow)}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.financing')}:</span>
                      <div className="font-semibold">
                        {reportProperty.financingType === 'conventional' && t('propertyReport.financingType.conventional')}
                        {reportProperty.financingType === 'cmhc' && t('propertyReport.financingType.cmhc')}
                        {reportProperty.financingType === 'cmhc_aph' && `${t('propertyReport.financingType.cmhc_aph')} (${reportProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    )}
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.maxLoan')}:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    )}
                    {reportProperty.financingType === 'private' && (
                      <div>
                      <span className="text-gray-600">{t('propertyReport.loanGranted')}:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    )}
                    {reportProperty.financingType === 'private' && (
                      <div>
                        <span className="text-gray-600">{t('propertyReport.ltv')}:</span>
                        <div className="font-semibold">{formatPercent(reportAnalysis.loanValueRatio)}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">{t('propertyReport.downPayment')}:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.downPayment)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.totalInvestment')}:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.totalInvestment)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">{t('propertyReport.purchasePrice')}:</span>
                      <div className="font-semibold">
                        {formatMoney(parseFloat(reportProperty.purchasePrice) || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.numberOfUnits')}:</span>
                      <div className="font-semibold">{reportProperty.numberOfUnits || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.pricePerDoor')}:</span>
                      <div className="font-semibold">
                        {formatMoney(Math.round(reportAnalysis.pricePerUnit || 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.averageRentPerDoor')}:</span>
                      <div className="font-semibold">{formatMoney(averageRentPerDoor)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {reportProperty.financingType !== 'private' && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.financing')}:</span>
                      <div className="font-semibold">
                        {reportProperty.financingType === 'conventional' && t('propertyReport.financingType.conventional')}
                        {reportProperty.financingType === 'cmhc' && t('propertyReport.financingType.cmhc')}
                        {reportProperty.financingType === 'cmhc_aph' && `${t('propertyReport.financingType.cmhc_aph')} (${reportProperty.aphPoints} pts)`}
                      </div>
                    </div>
                    )}
                    <div>
                      <span className="text-gray-600">{t('propertyReport.maxLoan')}:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.maxLoanAmount)}</div>
                    </div>
                    {reportProperty.financingType === 'private' && (
                      <div>
                        <span className="text-gray-600">{t('propertyReport.ltv')}:</span>
                        <div className="font-semibold">{formatPercent(reportAnalysis.loanValueRatio)}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">{t('propertyReport.downPayment')}:</span>
                      <div className="font-semibold">{formatMoney(reportAnalysis.downPayment)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('propertyReport.totalInvestment')}:</span>
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
            <h3 className="text-lg font-medium text-gray-700 mb-1">{t('propertyReport.futureReturns.title')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('propertyReport.futureReturns.desc1')} {returnYears} {t('propertyReport.futureReturns.desc2')}
            </p>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.subScenario')}</label>
              <select
                value={selectedSubScenarioId}
                onChange={(e) => setSelectedSubScenarioId(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="">{t('propertyReport.none')}</option>
                {subScenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || t('propertyReport.untitled')} ({typeLabels[s.type] || s.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.years')}</label>
                <input
                  type="number"
                  min="1"
                  value={returnYears}
                  onChange={(e) => setReturnYears(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.incomeGrowth')}</label>
                {isOptimization ? (
                  <input
                    type="text"
                    disabled
                    value={t('notApplicable')}
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
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.expenseGrowth')}</label>
                {isOptimization ? (
                  <input
                    type="text"
                    disabled
                    value={t('notApplicable')}
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
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.valueAppreciation')}</label>
                {isOptimization ? (
                  <input
                    type="text"
                    disabled
                    value={t('notApplicable')}
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
                <p className="text-sm text-gray-500">{t('propertyReport.globalReturn.prefix')} {returnYears} {t('propertyReport.globalReturn.suffix')}</p>
                <p className="font-semibold">{formatPercent(multiYearReturn)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('propertyReport.annualizedReturn')}</p>
                <p className="font-semibold">{formatPercent(multiYearAnnualized)}</p>
              </div>
              <div className="text-center relative">
                <button
                  type="button"
                  onClick={() => setShowIRRInfo(!showIRRInfo)}
                  className="text-sm text-gray-500 underline cursor-pointer"
                >
                  {t('propertyReport.irrAtYear.prefix')} {returnYears}{t('propertyReport.irrAtYear.suffix')}
                </button>
                {showIRRInfo && (
                  <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white border rounded shadow-lg text-xs text-gray-700">
                    {t('propertyReport.irrInfo')}
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
              {t('propertyReport.amortization')}
            </button>
            <button
              onClick={() =>
                setEditingScenario({ parentScenarioId: baseScenarioId })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('propertyReport.newScenario')}
            </button>
            <button
              onClick={handleGeneratePDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t('propertyReport.generatePdf')}
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
