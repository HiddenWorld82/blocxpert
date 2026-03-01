import React, { useEffect, useMemo, useState, useRef } from "react";
import { Eye, Pencil } from "lucide-react";
import FinancingSection from "./sections/FinancingSection";
import FinancingFeesSection from "./sections/FinancingFeesSection";
import FormattedNumberInput, { parseLocaleNumber } from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
import calculateFutureScenario from "../utils/calculateFutureScenario";
import { getScenarios, saveScenario, updateScenario } from "../services/dataService";
import { getShareScenarios, saveShareScenario, updateShareScenario } from "../services/shareService";
import { useLanguage } from "../contexts/LanguageContext";

export default function FutureScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  type = "refinancing",
  property,
  advancedExpenses,
  shareToken = null,
  shareFilterByCreatorUid = null,
  shareCreatorInfo = null,
}) {
  const [scenario, setScenario] = useState({
    title: "",
    refinanceYears: "",
    marketValue: "",
    revenueGrowthPct: "2",
    expenseGrowthPct: "2.5",
    valueAppreciationPct: "3",
    financing: {},
    financingFees: {},
    parentScenarioId: "",
    ...initialScenario,
  });

  const [lockedFields, setLockedFields] = useState({
    debtCoverage: true,
  });

  const [parentScenario, setParentScenario] = useState(null);
  const lastMarketValueEstimateRef = useRef("");
  const [isViewingOnly, setIsViewingOnly] = useState(Boolean(initialScenario.id));

  const { t } = useLanguage();

  useEffect(() => {
    if (!propertyId && !shareToken) return;
    const onList = (scenarios) => {
      const baseId = scenario.parentScenarioId;
      const parent = baseId
        ? scenarios.find((s) => s.id === baseId)
        : scenarios.find((s) => s.type === "initialFinancing");
      setParentScenario(parent);
    };
    let unsub;
    if (shareToken) {
      unsub = getShareScenarios(shareToken, (list) => {
        const filtered = shareFilterByCreatorUid
          ? list.filter((s) => !s.createdByUid || s.createdByUid === shareFilterByCreatorUid)
          : list;
        onList(filtered);
      });
    } else {
      unsub = getScenarios(propertyId, onList);
    }
    return () => {
      const u = unsub;
      queueMicrotask(() => u?.());
    };
  }, [propertyId, shareToken, shareFilterByCreatorUid, scenario.parentScenarioId]);

  useEffect(() => {
    setScenario({
      title: "",
      refinanceYears: "",
      marketValue: "",
      revenueGrowthPct: "2",
      expenseGrowthPct: "2.5",
      valueAppreciationPct: "3",
      financing: {},
      financingFees: {},
      parentScenarioId: "",
      ...initialScenario,
    });
    lastMarketValueEstimateRef.current =
      parseLocaleNumber(initialScenario.marketValue) || "";
    setIsViewingOnly(Boolean(initialScenario.id));
  }, [initialScenario.id]);

  const handleFinancingChange = (financing, field) => {
    if (field === "debtCoverageRatio") {
      setLockedFields((prev) => ({ ...prev, debtCoverage: false }));
    } else if (field === "financingType") {
      setLockedFields((prev) => ({ ...prev, debtCoverage: true }));
    }
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleFeesChange = (fees) => {
    setScenario((prev) => ({ ...prev, financingFees: fees }));
  };

  const handleChange = (field, value) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const computeTotalFees = () => {
    return Object.values(scenario.financingFees).reduce(
      (sum, val) => sum + Number(parseLocaleNumber(val) || 0),
      0,
    );
  };

  useEffect(() => {
    if (!property?.purchasePrice) return;
    const years = Math.max(
      parseFloat(parseLocaleNumber(scenario.refinanceYears)) || 0,
      0,
    );
    if (!years) return;
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const appreciationPct =
      (parseFloat(parseLocaleNumber(scenario.valueAppreciationPct)) || 0) /
      100;
    const estimated = Math.round(
      purchasePrice * Math.pow(1 + appreciationPct, years)
    ).toString();
    if (
      !scenario.marketValue ||
      scenario.marketValue === lastMarketValueEstimateRef.current
    ) {
      setScenario((prev) => ({ ...prev, marketValue: estimated }));
    }
    lastMarketValueEstimateRef.current = estimated;
  }, [
    scenario.refinanceYears,
    property?.purchasePrice,
    scenario.valueAppreciationPct,
  ]);

  const { analysisProperty, analysis, equityWithdrawal } = useMemo(
    () =>
      calculateFutureScenario(
        scenario,
        property,
        parentScenario,
        advancedExpenses,
      ),
    [scenario, property, parentScenario, advancedExpenses],
  );

  useEffect(() => {
    const financingType = scenario.financing.financingType;
    const units = parseInt(property?.numberOfUnits) || 0;
    if (["cmhc", "cmhc_aph"].includes(financingType) && units > 0) {
      const analysisAmount = (units * 150).toString();
      if (scenario.financingFees.cmhcAnalysis !== analysisAmount) {
        setScenario((prev) => ({
          ...prev,
          financingFees: { ...prev.financingFees, cmhcAnalysis: analysisAmount },
        }));
      }
    } else if (scenario.financingFees.cmhcAnalysis) {
      setScenario((prev) => ({
        ...prev,
        financingFees: { ...prev.financingFees, cmhcAnalysis: "" },
      }));
    }
  }, [
    scenario.financing.financingType,
    property?.numberOfUnits,
    scenario.financingFees.cmhcAnalysis,
  ]);

  useEffect(() => {
    const financingType = scenario.financing.financingType;
    if (["cmhc", "cmhc_aph"].includes(financingType)) {
      const taxAmount = analysis?.cmhcTax
        ? Math.round(analysis.cmhcTax).toString()
        : "";
      if (scenario.financingFees.cmhcTax !== taxAmount) {
        setScenario((prev) => ({
          ...prev,
          financingFees: { ...prev.financingFees, cmhcTax: taxAmount },
        }));
      }
    } else if (scenario.financingFees.cmhcTax) {
      setScenario((prev) => ({
        ...prev,
        financingFees: { ...prev.financingFees, cmhcTax: "" },
      }));
    }
  }, [analysis?.cmhcTax, scenario.financing.financingType, scenario.financingFees.cmhcTax]);

  const isEquityNegative = equityWithdrawal < 0;

  const keyIndicatorExclusions = useMemo(
    () =>
      type === "refinancing"
        ? ["coc", "loanPaydownReturn", "appreciationReturn", "totalReturn"]
        : [],
    [type],
  );


  useEffect(() => {
    if (!lockedFields.debtCoverage) return;
    const financingType = scenario.financing.financingType;
    const units = parseInt(property?.numberOfUnits) || 1;
    let newRatio = "1.15";
    if (financingType === "cmhc") {
      newRatio = units >= 7 ? "1.3" : "1.1";
    } else if (financingType === "cmhc_aph") {
      newRatio = "1.1";
    }
    if (scenario.financing.debtCoverageRatio !== newRatio) {
      setScenario((prev) => ({
        ...prev,
        financing: { ...prev.financing, debtCoverageRatio: newRatio },
      }));
    }
  }, [
    scenario.financing.financingType,
    property?.numberOfUnits,
    lockedFields.debtCoverage,
  ]);

  const handleSave = async () => {
    const { id, ...dataWithoutId } = scenario;
    const data = { ...dataWithoutId, type };
    if (shareToken) {
      if (id) {
        await updateShareScenario(shareToken, id, data);
        onSaved && onSaved({ id, ...data });
      } else {
        const newId = await saveShareScenario(shareToken, data, shareCreatorInfo);
        onSaved && onSaved({ id: newId, ...data });
      }
    } else {
      if (id) {
        await updateScenario(propertyId, id, data);
        onSaved && onSaved({ id, ...data });
      } else {
        const newId = await saveScenario(propertyId, data);
        onSaved && onSaved({ id: newId, ...data });
      }
    }
  };

  const titleText = {
    refinancing: t("scenarioForm.refinancing.title"),
  }[type] || t("scenarioForm.genericTitle");

  const canToggleView = Boolean(initialScenario.id || scenario.id);

  const renderScenarioSections = () => (
    <>
      <FinancingSection
        financing={scenario.financing}
        onChange={handleFinancingChange}
      />
      <FinancingFeesSection
        fees={scenario.financingFees}
        onChange={handleFeesChange}
        analysis={{ financingFees: computeTotalFees() }}
        isCMHC={["cmhc", "cmhc_aph"].includes(scenario.financing.financingType)}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{titleText}</h2>
            <div className="flex items-center gap-2">
              {canToggleView && (
                <button
                  onClick={() => setIsViewingOnly((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded text-gray-600 hover:text-gray-800 hover:border-gray-300"
                >
                  {isViewingOnly ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      {t('scenarioForm.editScenario')}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      {t('scenarioForm.viewSummary')}
                    </>
                  )}
                </button>
              )}
              {onBack && (
                <>
                  {canToggleView && (
                    <button
                      onClick={onBack}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded text-gray-600 hover:text-gray-800 hover:border-gray-300"
                    >
                      {t('close')}
                    </button>
                  )}
                  {!canToggleView && (
                    <button
                      onClick={onBack}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← {t('back')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {isViewingOnly && scenario.title && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-500">{t('scenarioForm.titleLabel')}</div>
                <div className="text-lg font-semibold text-gray-900">{scenario.title}</div>
              </div>
            )}

            {!isViewingOnly && (
              <div className="border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  {t('scenarioForm.parameters')}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">{t('scenarioForm.titleLabel')}</label>
                    <input
                      type="text"
                      value={scenario.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder={t('scenarioForm.titlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('scenarioForm.revenueGrowthPct')}</label>
                    <FormattedNumberInput
                      value={scenario.revenueGrowthPct || ""}
                      onChange={(val) => handleChange("revenueGrowthPct", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('scenarioForm.expenseGrowthPct')}</label>
                    <FormattedNumberInput
                      value={scenario.expenseGrowthPct || ""}
                      onChange={(val) => handleChange("expenseGrowthPct", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('scenarioForm.valueAppreciationPct')}</label>
                    <FormattedNumberInput
                      value={scenario.valueAppreciationPct || ""}
                      onChange={(val) => handleChange("valueAppreciationPct", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('scenarioForm.refinanceYears')}</label>
                    <FormattedNumberInput
                      value={scenario.refinanceYears || ""}
                      onChange={(val) => handleChange("refinanceYears", val)}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('scenarioForm.marketValue')}</label>
                    <FormattedNumberInput
                      value={scenario.marketValue || ""}
                      onChange={(val) => handleChange("marketValue", val)}
                      className="w-full border rounded p-2"
                      type="currency"
                    />
                  </div>
                </div>
              </div>
            )}

            {!isViewingOnly && renderScenarioSections()}

            {analysis && (
              <>
                <KeyIndicators
                  analysis={analysis}
                  variant="future"
                  exclude={keyIndicatorExclusions}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <FinancialSummary
                    analysis={analysis}
                    advancedExpenses={advancedExpenses}
                  />
                  <FinancingSummary
                    analysis={analysis}
                    currentProperty={analysisProperty}
                    equityAmount={equityWithdrawal}
                  />
                </div>
              </>
            )}

            {isEquityNegative && (
              <div className="text-red-600 text-sm text-right">
                {t('scenarioForm.notPossible')}
              </div>
            )}
            {!isViewingOnly && (
              <div className="flex justify-end">
                {onSaved && (
                  <button
                    onClick={handleSave}
                    disabled={isEquityNegative}
                    className={`px-6 py-2 text-white rounded-lg hover:bg-blue-700 ${
                      isEquityNegative
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600"
                    }`}
                  >
                    {t('save')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

