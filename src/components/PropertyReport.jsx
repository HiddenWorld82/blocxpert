// components/PropertyReport.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useLanguage } from '../contexts/LanguageContext';
import KeyIndicators from './sections/KeyIndicators';
import FinancialSummary from './sections/FinancialSummary';
import FinancingSummary from './sections/FinancingSummary';
import ExecutiveSummary from './sections/ExecutiveSummary';
import DealSummary from './sections/DealSummary';
import SchlComplianceSection from './sections/SchlComplianceSection';
import ScenarioList from './ScenarioList';
import FutureScenarioForm from './FutureScenarioForm';
import RenewScenarioForm from './RenewScenarioForm';
import OptimisationScenarioForm from './OptimisationScenarioForm';
import calculateRentability from '../utils/calculateRentability';
import calculateReturnAfterYears from '../utils/calculateReturnAfterYears';
import calculateOptimisationScenario from '../utils/calculateOptimisationScenario';
import calculateRenewScenario from '../utils/calculateRenewScenario';
import calculateFutureScenario from '../utils/calculateFutureScenario';
import { getScenarios, getScenario } from '../services/dataService';
import { getShareScenarios, getShare, getShareScenariosOnce } from '../services/shareService';
import { getAphMaxLtvRatio } from '../utils/cmhc';
import { getMarketParamsById } from '../services/marketParamsService';
import { RentalizerPdfDocument } from '../pdf/RentalizerPdfDocument';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_INCOME_GROWTH = 2;
const DEFAULT_EXPENSE_GROWTH = 2.5;
const DEFAULT_VALUE_GROWTH = 3;

const PropertyReport = ({
  currentProperty,
  setCurrentStep,
  analysis: baseAnalysis,
  onSave,
  advancedExpenses,
  scenario,
  onViewAmortization,
  shareToken = null,
  shareFilterByCreatorUid = null,
  baseScenarios: baseScenariosProp = null,
  shareCreatorInfo = null,
  sharedScenariosFromClients = null,
}) => {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const [marketParamsVersion, setMarketParamsVersion] = useState(null);
  const [expandedClientScenario, setExpandedClientScenario] = useState(null);
  const [clientScenarioShareData, setClientScenarioShareData] = useState(null);
  const [parentScenarioForRenewal, setParentScenarioForRenewal] = useState(null);

  useEffect(() => {
    const id = userProfile?.selectedMarketParamsId;
    if (!id) {
      setMarketParamsVersion(null);
      return;
    }
    getMarketParamsById(id)
      .then((v) => setMarketParamsVersion(v ? { label: v.label, createdAt: v.createdAt } : null))
      .catch(() => setMarketParamsVersion(null));
  }, [userProfile?.selectedMarketParamsId]);

  useEffect(() => {
    if (!expandedClientScenario?.shareToken) {
      setClientScenarioShareData(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      getShare(expandedClientScenario.shareToken),
      getShareScenariosOnce(expandedClientScenario.shareToken),
    ])
      .then(([shareData, shareScenarios]) => {
        if (cancelled || !shareData?.snapshot) return;
        const base = shareData.snapshot.scenarios || [];
        setClientScenarioShareData({
          property: shareData.snapshot.property || currentProperty,
          baseScenarios: base,
          shareScenarios: shareScenarios || [],
        });
      })
      .catch(() => {
        if (!cancelled) setClientScenarioShareData(null);
      });
    return () => { cancelled = true; };
  }, [expandedClientScenario?.shareToken, expandedClientScenario?.id, currentProperty]);

  useEffect(() => {
    if (!currentProperty?.id || !scenario || scenario.type !== 'renewal' || !scenario.parentScenarioId || shareToken) {
      setParentScenarioForRenewal(null);
      return;
    }
    let cancelled = false;
    getScenario(currentProperty.id, scenario.parentScenarioId)
      .then((parent) => {
        if (!cancelled) setParentScenarioForRenewal(parent);
      })
      .catch(() => {
        if (!cancelled) setParentScenarioForRenewal(null);
      });
    return () => { cancelled = true; };
  }, [currentProperty?.id, scenario, shareToken]);

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

  const renewalResult = useMemo(() => {
    if (scenario?.type === 'renewal' && parentScenarioForRenewal && currentProperty) {
      return calculateRenewScenario(scenario, currentProperty, parentScenarioForRenewal, advancedExpenses);
    }
    return null;
  }, [scenario, currentProperty, parentScenarioForRenewal, advancedExpenses]);

  const reportProperty = useMemo(() => {
    if (!scenario) return currentProperty;
    if (renewalResult) {
      return { ...renewalResult.analysisProperty, ...renewalResult.combinedFinancing };
    }
    const merged = { ...currentProperty, ...(scenario.financing || {}), ...(scenario.acquisitionCosts || {}) };
    return merged;
  }, [currentProperty, scenario, renewalResult]);

  const financingTypeLabel = useMemo(() => {
    const ft = reportProperty.financingType;
    if (ft === 'conventional') return t('propertyReport.financingType.conventional');
    if (ft === 'cmhc') return t('propertyReport.financingType.cmhc');
    if (ft === 'cmhc_aph') return `${t('propertyReport.financingType.cmhc_aph')} (${reportProperty.aphPoints ?? ''} pts)`;
    return ft ? String(ft) : '—';
  }, [reportProperty.financingType, reportProperty.aphPoints, t]);

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
        ? renewalResult
          ? renewalResult.analysis
          : calculateRentability(reportProperty, advancedExpenses)
        : baseAnalysis,
    [scenario, reportProperty, advancedExpenses, baseAnalysis, renewalResult]
  );

  const averageRentPerDoor =
    ((parseFloat(reportProperty.annualRent) || 0) /
      (parseInt(reportProperty.numberOfUnits) || 1)) /
    12;

  const [returnYears, setReturnYears] = useState(5);
  const [incomeGrowth, setIncomeGrowth] = useState(DEFAULT_INCOME_GROWTH);
  const [expenseGrowth, setExpenseGrowth] = useState(DEFAULT_EXPENSE_GROWTH);
  const [valueGrowth, setValueGrowth] = useState(DEFAULT_VALUE_GROWTH);
  const [subScenarios, setSubScenarios] = useState([]);
  const [selectedSubScenarioId, setSelectedSubScenarioId] = useState('');
  const [reportType, setReportType] = useState('client'); // client | bank | advanced
  const selectedSubScenario = useMemo(
    () => subScenarios.find((s) => s.id === selectedSubScenarioId),
    [subScenarios, selectedSubScenarioId]
  );
  const subScenarioProperty = useMemo(
    () =>
      selectedSubScenario
        ? { ...currentProperty, ...selectedSubScenario.financing, ...selectedSubScenario.acquisitionCosts }
        : null,
    [currentProperty, selectedSubScenario]
  );
  const manualGrowthRef = useRef({
    income: DEFAULT_INCOME_GROWTH,
    expense: DEFAULT_EXPENSE_GROWTH,
    value: DEFAULT_VALUE_GROWTH,
  });
  const previousSubScenarioRef = useRef(null);
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
      const parentScenario =
        (scenario &&
          (scenario.id === selectedSubScenario.parentScenarioId ||
            scenario.parentScenarioId === selectedSubScenario.parentScenarioId))
          ? scenario
          : subScenarios.find(
              (sc) => sc.id === selectedSubScenario.parentScenarioId,
            );
      const { analysis } = calculateOptimisationScenario(
        selectedSubScenario,
        currentProperty,
        parentScenario,
        advancedExpenses,
      );
      return analysis;
    } else if (selectedSubScenario.type === 'renewal') {
      const parentScenario =
        scenario?.id === selectedSubScenario.parentScenarioId
          ? scenario
          : subScenarios.find((s) => s.id === selectedSubScenario.parentScenarioId);
      const { analysis } = calculateRenewScenario(
        selectedSubScenario,
        currentProperty,
        parentScenario,
        advancedExpenses,
      );
      return analysis;
    }
    return null;
  }, [
    selectedSubScenario,
    currentProperty,
    reportAnalysis,
    advancedExpenses,
    scenario,
    subScenarios,
  ]);
  const subScenarioPropertyForList = useMemo(() => {
    if (!selectedSubScenario || !subScenarioAnalysis) return subScenarioProperty;
    if (selectedSubScenario.type === 'renewal') {
      const parent =
        scenario?.id === selectedSubScenario.parentScenarioId
          ? scenario
          : subScenarios.find((s) => s.id === selectedSubScenario.parentScenarioId);
      const { analysisProperty, combinedFinancing } = calculateRenewScenario(
        selectedSubScenario,
        currentProperty,
        parent,
        advancedExpenses,
      );
      return { ...analysisProperty, ...combinedFinancing };
    }
    return subScenarioProperty;
  }, [
    selectedSubScenario,
    subScenarioAnalysis,
    subScenarioProperty,
    scenario,
    subScenarios,
    currentProperty,
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

  const expandedClientScenarioAnalysis = useMemo(() => {
    if (!expandedClientScenario || !clientScenarioShareData) return null;
    const { property, baseScenarios, shareScenarios } = clientScenarioShareData;
    const sc = expandedClientScenario;
    const allScenarios = [...baseScenarios, ...shareScenarios];
    let parent = sc.parentScenarioId
      ? allScenarios.find((s) => s.id === sc.parentScenarioId)
      : allScenarios.find((s) => s.type === 'initialFinancing');
    if (sc.type === 'renewal') {
      const initialAmort = parent?.financing?.amortization ?? property?.amortization ?? 25;
      const initialTerm = parent?.financing?.term ?? sc.financing?.term ?? 0;
      if (!parent || parent.financing?.amortization == null || parent.financing?.term == null) {
        parent = {
          ...(parent || {}),
          financing: {
            ...(parent?.financing || {}),
            amortization: initialAmort,
            term: initialTerm,
          },
        };
      }
      const { analysis, analysisProperty, combinedFinancing } = calculateRenewScenario(sc, property, parent, advancedExpenses);
      return {
        analysis,
        property: { ...analysisProperty, ...combinedFinancing },
        combinedFinancing,
      };
    }
    if (sc.type === 'refinancing') {
      const { analysis, analysisProperty } = calculateFutureScenario(sc, property, parent, advancedExpenses);
      return { analysis, property: analysisProperty || property };
    }
    if (sc.type === 'optimization') {
      const { analysis } = calculateOptimisationScenario(sc, property, parent, advancedExpenses);
      return { analysis, property: property };
    }
    return null;
  }, [expandedClientScenario, clientScenarioShareData, advancedExpenses]);

  const isClientScenarioExpanded = (sc) =>
    expandedClientScenario && expandedClientScenario.shareToken === sc.shareToken && expandedClientScenario.id === sc.id;

  const baseScenarioId = scenario ? scenario.parentScenarioId || scenario.id : null;

  useEffect(() => {
    if (!currentProperty?.id) return;
    const loadScenarios = (scs) => {
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
    };
    let unsub;
    if (shareToken) {
      unsub = getShareScenarios(shareToken, (list) => {
        const filteredByCreator = shareFilterByCreatorUid
          ? list.filter((s) => !s.createdByUid || s.createdByUid === shareFilterByCreatorUid)
          : list;
        const full = [...(baseScenariosProp || []), ...filteredByCreator];
        loadScenarios(full);
      });
    } else {
      unsub = getScenarios(currentProperty.id, loadScenarios);
    }
    return () => {
      const u = unsub;
      queueMicrotask(() => u?.());
    };
  }, [currentProperty?.id, baseScenarioId, shareToken, shareFilterByCreatorUid, baseScenariosProp]);

  useEffect(() => {
    const previousSubScenario = previousSubScenarioRef.current;
    const baselineIncome = Number.isFinite(manualGrowthRef.current.income)
      ? manualGrowthRef.current.income
      : DEFAULT_INCOME_GROWTH;
    const baselineExpense = Number.isFinite(manualGrowthRef.current.expense)
      ? manualGrowthRef.current.expense
      : DEFAULT_EXPENSE_GROWTH;
    const baselineValue = Number.isFinite(manualGrowthRef.current.value)
      ? manualGrowthRef.current.value
      : DEFAULT_VALUE_GROWTH;

    if (selectedSubScenario?.type === 'refinancing') {
      const revenueGrowth = parseFloat(selectedSubScenario.revenueGrowthPct);
      const expenseGrowthPct = parseFloat(selectedSubScenario.expenseGrowthPct);
      const valueGrowthPct = parseFloat(
        selectedSubScenario.valueAppreciationPct,
      );
      setIncomeGrowth(Number.isFinite(revenueGrowth) ? revenueGrowth : 0);
      setExpenseGrowth(Number.isFinite(expenseGrowthPct) ? expenseGrowthPct : 0);
      setValueGrowth(Number.isFinite(valueGrowthPct) ? valueGrowthPct : 0);
    } else if (selectedSubScenario?.type === 'optimization') {
      setIncomeGrowth(baselineIncome);
      setExpenseGrowth(baselineExpense);
      setValueGrowth(baselineValue);
    } else if (!selectedSubScenario && previousSubScenario) {
      setIncomeGrowth(baselineIncome);
      setExpenseGrowth(baselineExpense);
      setValueGrowth(baselineValue);
    }

    if (!selectedSubScenario && previousSubScenario) {
      manualGrowthRef.current = {
        income: baselineIncome,
        expense: baselineExpense,
        value: baselineValue,
      };
    }

    previousSubScenarioRef.current = selectedSubScenario;
  }, [selectedSubScenario]);

  const isRefinancing = selectedSubScenario?.type === 'refinancing';
  const isOptimization = selectedSubScenario?.type === 'optimization';

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
      onBack: () => setEditingScenario(null),
      initialScenario: editingScenario,
      shareToken: shareToken || undefined,
      shareFilterByCreatorUid: shareFilterByCreatorUid || undefined,
      shareCreatorInfo: shareCreatorInfo || undefined,
      baseScenarios: shareToken ? baseScenariosProp || [] : undefined,
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
                      <div className="font-semibold">{financingTypeLabel}</div>
                    </div>
                    )}
                    {(reportAnalysis.mortgageRate != null && reportAnalysis.mortgageRate !== '') && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.interestRate')}:</span>
                      <div className="font-semibold">{formatPercent(reportAnalysis.mortgageRate)}</div>
                    </div>
                    )}
                    {(reportProperty.amortization != null && reportProperty.amortization !== '') && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.amortizationYears')}:</span>
                      <div className="font-semibold">{reportProperty.amortization} {t('propertyReport.years')}</div>
                    </div>
                    )}
                    {(reportProperty.term != null && reportProperty.term !== '') && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.financingTerm')}:</span>
                      <div className="font-semibold">{reportProperty.term} {t('propertyReport.years')}</div>
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
                      <div className="font-semibold">{financingTypeLabel}</div>
                    </div>
                    )}
                    {(reportAnalysis.mortgageRate != null && reportAnalysis.mortgageRate !== '') && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.interestRate')}:</span>
                      <div className="font-semibold">{formatPercent(reportAnalysis.mortgageRate)}</div>
                    </div>
                    )}
                    {(reportProperty.amortization != null && reportProperty.amortization !== '') && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.amortizationYears')}:</span>
                      <div className="font-semibold">{reportProperty.amortization} {t('propertyReport.years')}</div>
                    </div>
                    )}
                    {(reportProperty.term != null && reportProperty.term !== '') && (
                    <div>
                      <span className="text-gray-600">{t('propertyReport.financingTerm')}:</span>
                      <div className="font-semibold">{reportProperty.term} {t('propertyReport.years')}</div>
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
            exclude={scenario?.type === 'renewal' ? ['mrb', 'mrn', 'tga'] : []}
          />
          <SchlComplianceSection analysis={reportAnalysis} property={reportProperty} />
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <FinancialSummary analysis={reportAnalysis} advancedExpenses={advancedExpenses} />
            <FinancingSummary
              analysis={reportAnalysis}
              currentProperty={reportProperty}
              financing={reportProperty}
              scenarioType="initialFinancing"
            />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-1">{t('propertyReport.futureReturns.title')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('propertyReport.futureReturns.desc1')} {returnYears} {t('propertyReport.futureReturns.desc2')}
            </p>
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.subScenario')}</label>
                <select
                  value={selectedSubScenarioId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedSubScenarioId(nextId);
                    if (nextId) setExpandedClientScenario(null);
                  }}
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
              {selectedSubScenarioId && (
                <button
                  type="button"
                  onClick={() => setSelectedSubScenarioId('')}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                >
                  {t('close')}
                </button>
              )}
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
                <input
                  type="number"
                  step="0.1"
                  value={incomeGrowth ?? ''}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    const nextValue = Number.isFinite(parsed) ? parsed : 0;
                    setIncomeGrowth(nextValue);
                    if (!selectedSubScenario) {
                      manualGrowthRef.current = {
                        ...manualGrowthRef.current,
                        income: nextValue,
                      };
                    }
                  }}
                  disabled={isRefinancing || isOptimization}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.expenseGrowth')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={expenseGrowth ?? ''}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    const nextValue = Number.isFinite(parsed) ? parsed : 0;
                    setExpenseGrowth(nextValue);
                    if (!selectedSubScenario) {
                      manualGrowthRef.current = {
                        ...manualGrowthRef.current,
                        expense: nextValue,
                      };
                    }
                  }}
                  disabled={isRefinancing || isOptimization}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('propertyReport.valueAppreciation')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={valueGrowth ?? ''}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    const nextValue = Number.isFinite(parsed) ? parsed : 0;
                    setValueGrowth(nextValue);
                    if (!selectedSubScenario) {
                      manualGrowthRef.current = {
                        ...manualGrowthRef.current,
                        value: nextValue,
                      };
                    }
                  }}
                  disabled={isRefinancing || isOptimization}
                  className="w-full px-2 py-1 border rounded"
                />
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

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
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
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">
                {t('propertyReport.reportType')}
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="client">
                  {t('propertyReport.reportType.client')}
                </option>
                <option value="bank">
                  {t('propertyReport.reportType.bank')}
                </option>
                <option value="advanced">
                  {t('propertyReport.reportType.advanced')}
                </option>
              </select>
            </div>
            <PDFDownloadLink
              document={
                <RentalizerPdfDocument
                  title={t('propertyReport.title')}
                  property={reportProperty}
                  analysis={reportAnalysis}
                  reportType={reportType}
                  futureReturns={{
                    years: returnYears,
                    totalReturn: multiYearReturn,
                    annualizedReturn: multiYearAnnualized,
                    irr: multiYearIRR,
                  }}
                  marketParamsVersion={marketParamsVersion}
                />
              }
              fileName={`rapport-${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  {loading
                    ? t('propertyReport.generatingPdf')
                    : t('propertyReport.generatePdf')}
                </button>
              )}
            </PDFDownloadLink>
          </div>

          <div className="mb-8">
            <ScenarioList
              propertyId={currentProperty.id}
              shareToken={shareToken || undefined}
              baseScenarios={shareToken ? baseScenariosProp : undefined}
              shareCreatorInfo={shareToken ? shareCreatorInfo : undefined}
              shareFilterByCreatorUid={shareToken ? shareFilterByCreatorUid : undefined}
              onEdit={(sc) => setEditingScenario(sc)}
              excludeTypes={['initialFinancing']}
              parentScenarioId={baseScenarioId}
              selectedSubScenarioId={selectedSubScenarioId}
              expandedContent={
                selectedSubScenarioId && subScenarioAnalysis && subScenarioPropertyForList
                  ? {
                      analysis: subScenarioAnalysis,
                      property: subScenarioPropertyForList,
                      scenarioType: selectedSubScenario?.type,
                      advancedExpenses,
                    }
                  : null
              }
              editingScenarioId={
                editingScenario?.id && editingScenario?.parentScenarioId === baseScenarioId
                  ? editingScenario.id
                  : null
              }
              renderEditForm={
                editingScenario?.id && editingScenario?.parentScenarioId === baseScenarioId
                  ? () => renderScenarioForm()
                  : undefined
              }
            />
            {sharedScenariosFromClients && sharedScenariosFromClients.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  {t('building.clientSubScenarios')}
                </h3>
                <div className="space-y-2">
                  {sharedScenariosFromClients.map((sc) => (
                    <div key={`${sc.shareToken}-${sc.id}`} className="rounded-lg border border-indigo-100 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-indigo-50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="font-medium text-gray-800">{sc.title || t('propertyReport.untitled')}</span>
                          <span className="text-sm text-indigo-700">
                            {t('building.createdBy')} {sc.createdByName || sc.createdByUid || '—'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const isCurrentlyThis = expandedClientScenario?.shareToken === sc.shareToken && expandedClientScenario?.id === sc.id;
                            const next = isCurrentlyThis ? null : sc;
                            setExpandedClientScenario(next);
                            if (next) setSelectedSubScenarioId('');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          {isClientScenarioExpanded(sc) ? t('close') : t('view')}
                        </button>
                      </div>
                      {isClientScenarioExpanded(sc) && expandedClientScenarioAnalysis?.analysis && (
                        <div className="p-4 bg-white border-t border-indigo-100">
                          <KeyIndicators
                            analysis={expandedClientScenarioAnalysis.analysis}
                            variant={
                              expandedClientScenarioAnalysis.property?.financingType === 'private'
                                ? 'private'
                                : 'acquisition'
                            }
                            exclude={sc.type === 'renewal' ? ['mrb', 'mrn', 'tga'] : []}
                          />
                          <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <FinancialSummary
                              analysis={expandedClientScenarioAnalysis.analysis}
                              advancedExpenses={advancedExpenses}
                            />
                            <FinancingSummary
                              analysis={expandedClientScenarioAnalysis.analysis}
                              currentProperty={expandedClientScenarioAnalysis.property}
                              financing={expandedClientScenarioAnalysis.combinedFinancing ?? expandedClientScenarioAnalysis.property}
                              scenarioType={sc.type || 'renewal'}
                            />
                          </div>
                        </div>
                      )}
                      {isClientScenarioExpanded(sc) && !clientScenarioShareData && (
                        <div className="p-4 bg-white border-t border-indigo-100 text-sm text-gray-500">
                          {t('loading')}…
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {editingScenario && (!editingScenario.id || editingScenario.parentScenarioId !== baseScenarioId) && renderScenarioForm()}

          <DealSummary analysis={reportAnalysis} property={reportProperty} />
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
