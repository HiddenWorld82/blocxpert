import React, { useEffect, useMemo, useState, useRef } from "react";
import FinancingSection from "./sections/FinancingSection";
import FinancingFeesSection from "./sections/FinancingFeesSection";
import RevenueSection from "./sections/RevenueSection";
import OperatingExpensesSection from "./sections/OperatingExpensesSection";
import FormattedNumberInput, { parseLocaleNumber } from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
import calculateOptimisationScenario from "../utils/calculateOptimisationScenario";
import { getScenarios, saveScenario, updateScenario } from "../services/dataService";
import defaultProperty from "../defaults/defaultProperty";
import schlExpenses from "../defaults/schlExpenses";
import { useLanguage } from "../contexts/LanguageContext";

const baseScenario = {
  title: "",
  refinanceYears: "",
  marketValue: "",
  financing: {},
  financingFees: {},
  revenue: {},
  operatingExpenses: {
    vacancyRate: defaultProperty.vacancyRate,
    maintenance: "",
    managementRate: "",
    concierge: "",
  },
  parentScenarioId: "",
};

export default function OptimisationScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  type = "optimization",
  property,
  advancedExpenses,
}) {
  const buildScenarioState = (init = {}) => {
    const toStringOrEmpty = (value) => {
      if (value === undefined || value === null || value === "") {
        return "";
      }
      return typeof value === "number" ? value.toString() : value;
    };

    const units = parseInt(property?.numberOfUnits) || 0;
    const province = property?.province;
    const structureType = property?.structureType || "woodFrame";
    const provinceConfig = province ? schlExpenses[province] : null;
    let schlConfig;
    if (provinceConfig) {
      if (structureType === "woodFrame") {
        schlConfig = provinceConfig.woodFrame[units <= 11 ? "small" : "large"];
      } else {
        schlConfig = provinceConfig.concrete.any;
      }
    }

    const defaultOperatingExpenses = {
      vacancyRate:
        toStringOrEmpty(property?.vacancyRate) ||
        baseScenario.operatingExpenses.vacancyRate,
      maintenance: schlConfig
        ? schlConfig.maintenance.toString()
        : toStringOrEmpty(property?.maintenance),
      managementRate: schlConfig
        ? schlConfig.managementRate.toString()
        : toStringOrEmpty(property?.managementRate),
      concierge: schlConfig
        ? schlConfig.salaries.toString()
        : toStringOrEmpty(property?.concierge),
      province: province || "",
      structureType,
    };

    return {
      ...baseScenario,
      ...init,
      operatingExpenses: {
        ...baseScenario.operatingExpenses,
        ...defaultOperatingExpenses,
        ...(init.operatingExpenses || {}),
      },
    };
  };

  const [scenario, setScenario] = useState(buildScenarioState(initialScenario));

  const [lockedFields, setLockedFields] = useState({
    debtCoverage: true,
  });

  const [parentScenario, setParentScenario] = useState(null);
  const lastMarketValueEstimateRef = useRef("");
  const { t } = useLanguage();

  useEffect(() => {
    if (!propertyId) return;
    const unsub = getScenarios(propertyId, (scenarios) => {
      const baseId = scenario.parentScenarioId;
      const parent = baseId
        ? scenarios.find((s) => s.id === baseId)
        : scenarios.find((s) => s.type === "initialFinancing");
      setParentScenario(parent);
    });
    return () => unsub && unsub();
  }, [propertyId, scenario.parentScenarioId]);

  useEffect(() => {
    setScenario(buildScenarioState(initialScenario));
    lastMarketValueEstimateRef.current =
      parseLocaleNumber(initialScenario.marketValue) || "";
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

  const handleRevenueChange = (revenue) => {
    setScenario((prev) => ({ ...prev, revenue }));
  };

  const handleExpensesChange = (update) => {
    setScenario((prev) => {
      const prevCombined = {
        numberOfUnits: property?.numberOfUnits,
        ...prev.revenue,
        ...prev.operatingExpenses,
      };
      const updatedCombined =
        typeof update === "function" ? update(prevCombined) : update;
      const revenueFields = [
        "annualRent",
        "parkingRevenue",
        "internetRevenue",
        "storageRevenue",
        "otherRevenue",
      ];
      const newRevenue = {};
      const newExpenses = {};
      Object.entries(updatedCombined).forEach(([key, value]) => {
        if (revenueFields.includes(key)) {
          newRevenue[key] = value;
        } else if (key !== "numberOfUnits") {
          newExpenses[key] = value;
        }
      });
      return {
        ...prev,
        revenue: { ...prev.revenue, ...newRevenue },
        operatingExpenses: newExpenses,
      };
    });
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
    if (!property?.purchasePrice || !scenario.refinanceYears) return;
    const purchasePrice = parseFloat(property.purchasePrice) || 0;
    const estimated = Math.round(
      purchasePrice * Math.pow(1 + 0.03, years)
    ).toString();
    if (
      !scenario.marketValue ||
      scenario.marketValue === lastMarketValueEstimateRef.current
    ) {
      setScenario((prev) => ({ ...prev, marketValue: estimated }));
    }
    lastMarketValueEstimateRef.current = estimated;
  }, [scenario.refinanceYears, property?.purchasePrice]);

  const { analysisProperty, analysis, equityWithdrawal } = useMemo(
    () =>
      calculateOptimisationScenario(
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
    () => [
      "coc",
      "loanPaydownReturn",
      "appreciationReturn",
      "totalReturn",
      "investmentEfficiency",
      "paybackPeriod",
    ],
    [],
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
    if (id) {
      await updateScenario(propertyId, id, data);
      onSaved && onSaved({ id, ...data });
    } else {
      const newId = await saveScenario(propertyId, data);
      onSaved && onSaved({ id: newId, ...data });
    }
  };

  const titleText = t("scenarioForm.optimization.title");


  const renderScenarioSections = () => (
    <>
      <RevenueSection
        revenue={scenario.revenue}
        onChange={handleRevenueChange}
        advancedExpenses={advancedExpenses}
      />
      <OperatingExpensesSection
        expenses={{
          numberOfUnits: property?.numberOfUnits,
          province: property?.province,
          structureType: property?.structureType,
          ...scenario.revenue,
          ...scenario.operatingExpenses,
        }}
        onChange={handleExpensesChange}
        advancedExpenses={advancedExpenses}
      />
      <FinancingSection
        financing={scenario.financing}
        onChange={handleFinancingChange}
      />
      <FinancingFeesSection
        fees={scenario.financingFees}
        onChange={handleFeesChange}
        analysis={{ financingFees: computeTotalFees() }}
        isCMHC={["cmhc", "cmhc_aph"].includes(scenario.financing.financingType)}
        includeWorkCost
      />
    </>
  );

return (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{titleText}</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← {t('back')}
            </button>
          )}
        </div>

        <div className="space-y-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              {t('scenarioForm.parameters')}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
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
                <label className="block text-sm font-medium mb-1">{t('scenarioForm.refinanceYears')}</label>
                <FormattedNumberInput
                  value={scenario.refinanceYears || ""}
                  onChange={(val) => handleChange("refinanceYears", val)}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>

          {renderScenarioSections()}

          {analysis && (
            <>
              <KeyIndicators
                analysis={analysis}
                variant="optimization"
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
                  scenarioType={type}
                />
              </div>
            </>
          )}

          {isEquityNegative && (
            <div className="text-red-600 text-sm text-right">
              {t('scenarioForm.notPossible')}
            </div>
          )}
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
        </div>
      </div>
    </div>
  </div>
);

}