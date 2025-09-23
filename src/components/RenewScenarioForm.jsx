import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import FormattedNumberInput, {
  formatPercentage,
} from "./FormattedNumberInput";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";
import calculateRenewScenario from "../utils/calculateRenewScenario";
import { getScenarios, saveScenario, updateScenario } from "../services/dataService";
import { useLanguage } from "../contexts/LanguageContext";

export default function RenewScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  property,
  advancedExpenses,
}) {
  const [scenario, setScenario] = useState({
    title: "",
    revenueGrowthPct: "2",
    expenseGrowthPct: "2.5",
    valueAppreciationPct: "3",
    financing: {},
    parentScenarioId: "",
    ...initialScenario,
  });

  const [parentScenario, setParentScenario] = useState(null);
  const [isViewingOnly, setIsViewingOnly] = useState(Boolean(initialScenario.id));
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
    setScenario({
      title: "",
      revenueGrowthPct: "2",
      expenseGrowthPct: "2.5",
      valueAppreciationPct: "3",
      financing: {},
      parentScenarioId: "",
      ...initialScenario,
    });
    setIsViewingOnly(Boolean(initialScenario.id));
  }, [initialScenario.id]);

  const handleFinancingChange = (financing) => {
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleChange = (field, value) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const { term, mortgageRate } = scenario.financing;
    const termText = term ? `${term} ans` : "(nouveau terme)";
    const rateText = mortgageRate
      ? formatPercentage(mortgageRate)
      : "(nouveau taux d'intérêt)";
    const newTitle = `Renouvellement ${termText} à ${rateText}`;
    if (scenario.title !== newTitle) {
      setScenario((prev) => ({ ...prev, title: newTitle }));
    }
  }, [scenario.financing.term, scenario.financing.mortgageRate]);

  const { analysisProperty, combinedFinancing, analysis } = useMemo(
    () =>
      calculateRenewScenario(
        scenario,
        property,
        parentScenario,
        advancedExpenses,
      ),
    [scenario, property, parentScenario, advancedExpenses],
  );

  const handleSave = async () => {
    const { id, marketValue, netIncomeIncreasePct, ...dataWithoutId } = scenario;
    const data = {
      ...dataWithoutId,
      type: "renewal",
      financing: combinedFinancing,
    };
    if (id) {
      await updateScenario(propertyId, id, data);
      onSaved && onSaved({ id, ...data });
    } else {
      const newId = await saveScenario(propertyId, data);
      onSaved && onSaved({ id: newId, ...data });
    }
  };

  const titleText = t("scenarioForm.renewal.title");
  const canToggleView = Boolean(initialScenario.id || scenario.id);

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
                <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                  ← {t('back')}
                </button>
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
                      readOnly
                      className="w-full border rounded p-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('scenarioForm.revenueGrowthPct')}
                    </label>
                    <FormattedNumberInput
                      value={scenario.revenueGrowthPct || ""}
                      onChange={(val) => handleChange("revenueGrowthPct", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('scenarioForm.expenseGrowthPct')}
                    </label>
                    <FormattedNumberInput
                      value={scenario.expenseGrowthPct || ""}
                      onChange={(val) => handleChange("expenseGrowthPct", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('scenarioForm.valueAppreciationPct')}
                    </label>
                    <FormattedNumberInput
                      value={scenario.valueAppreciationPct || ""}
                      onChange={(val) => handleChange("valueAppreciationPct", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                </div>
              </div>
            )}

            {!isViewingOnly && (
              <div className="border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-purple-600">
                  {t('financing.title')}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('scenarioForm.newInterestRate')}
                    </label>
                    <FormattedNumberInput
                      value={scenario.financing.mortgageRate || ""}
                      onChange={(val) =>
                        handleFinancingChange({ ...scenario.financing, mortgageRate: val })
                      }
                      className="w-full border rounded p-2"
                      type="percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('financing.term')}</label>
                    <select
                      value={scenario.financing.term || ""}
                      onChange={(e) =>
                        handleFinancingChange({ ...scenario.financing, term: e.target.value })
                      }
                      className="w-full border rounded p-2"
                    >
                      <option value="1">1 an</option>
                      <option value="2">2 ans</option>
                      <option value="3">3 ans</option>
                      <option value="5">5 ans</option>
                      <option value="10">10 ans</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {analysis && (
              <>
                <KeyIndicators analysis={analysis} variant="future" />
                <div className="grid md:grid-cols-2 gap-4">
                  <FinancialSummary analysis={analysis} advancedExpenses={advancedExpenses} />
                  <FinancingSummary
                    analysis={analysis}
                    currentProperty={analysisProperty}
                    financing={combinedFinancing}
                    scenarioType="renewal"
                  />
                </div>
              </>
            )}

            {!isViewingOnly && (
              <div className="flex justify-end">
                {onSaved && (
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
