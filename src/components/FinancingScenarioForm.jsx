import React, { useEffect, useState } from "react";
import FinancingSection from "./sections/FinancingSection";
import AcquisitionCosts from "./sections/AcquisitionCosts";
import BasicInfo from "./sections/BasicInfo";
import RevenueSection from "./sections/RevenueSection";
import OperatingExpensesSection from "./sections/OperatingExpensesSection";
import { parseLocaleNumber } from "./FormattedNumberInput";
import calculateWelcomeTax from "../utils/calculateWelcomeTax";
import { saveScenario, updateScenario } from "../services/dataService";

export default function FinancingScenarioForm({
  onBack,
  onSaved,
  propertyId,
  initialScenario = {},
  type = "initialFinancing",
  property,
  advancedExpenses,
}) {
  const [scenario, setScenario] = useState({
    title: "",
    financing: {},
    acquisitionCosts: {},
    refinanceDate: "",
    newMarketValue: "",
    netIncomeGrowth: "",
    cashOut: false,
    refinancingCosts: "",
    newDownPayment: "",
    ...initialScenario,
  });

  const [lockedFields] = useState({
    debtCoverage: true,
    welcomeTax: true,
  });

  useEffect(() => {
    setScenario({
      title: "",
      financing: {},
      acquisitionCosts: {},
      refinanceDate: "",
      newMarketValue: "",
      netIncomeGrowth: "",
      cashOut: false,
      refinancingCosts: "",
      newDownPayment: "",
      ...initialScenario,
    });
  }, [initialScenario.id]);

  const handleFinancingChange = (financing) => {
    setScenario((prev) => ({ ...prev, financing }));
  };

  const handleCostsChange = (costs) => {
    setScenario((prev) => ({ ...prev, acquisitionCosts: costs }));
  };

  const handleChange = (field, value) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const computeTotalCosts = () => {
    return Object.values(scenario.acquisitionCosts).reduce(
      (sum, val) => sum + Number(parseLocaleNumber(val) || 0),
      0
    );
  };

  useEffect(() => {
    if (!lockedFields.welcomeTax) return;
    const purchasePrice = parseFloat(property?.purchasePrice) || 0;
    if (purchasePrice > 0) {
      const welcomeTax = Math.round(calculateWelcomeTax(purchasePrice)).toString();
      if (scenario.acquisitionCosts.welcomeTax !== welcomeTax) {
        setScenario((prev) => ({
          ...prev,
          acquisitionCosts: { ...prev.acquisitionCosts, welcomeTax },
        }));
      }
    }
  }, [
    property?.purchasePrice,
    lockedFields.welcomeTax,
    scenario.acquisitionCosts.welcomeTax,
  ]);

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
    scenario.financing.debtCoverageRatio,
  ]);

  useEffect(() => {
    if (type !== "refinancing") return;
    const value = Number(parseLocaleNumber(scenario.newMarketValue)) || 0;
    const newDown = Math.round(value * 0.2).toString();
    if (scenario.newDownPayment !== newDown) {
      setScenario((prev) => ({ ...prev, newDownPayment: newDown }));
    }
  }, [type, scenario.newMarketValue, scenario.newDownPayment]);

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

  const titleText =
    type === "renovation" ? "Scénario de rénovation" : "Scénario de financement";

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
                ← Retour
              </button>
            )}
          </div>

          <div className="space-y-8">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Titre du scénario
              </h2>
              <input
                type="text"
                value={scenario.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Scénario"
              />
            </div>

            {property && (
              <>
                <BasicInfo
                  property={property}
                  onChange={() => {}}
                  advancedExpenses={advancedExpenses}
                  readOnly
                  disablePlaceAutocomplete
                />
                {type !== "refinancing" && (
                  <>
                    <RevenueSection
                      revenue={property}
                      onChange={() => {}}
                      advancedExpenses={advancedExpenses}
                      readOnly
                    />
                    <OperatingExpensesSection
                      expenses={property}
                      onChange={() => {}}
                      advancedExpenses={advancedExpenses}
                      readOnly
                    />
                  </>
                )}
              </>
            )}

            {type === "refinancing" && (
              <div className="border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  Paramètres de refinancement
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date de refinancement
                    </label>
                    <input
                      type="date"
                      value={scenario.refinanceDate}
                      onChange={(e) =>
                        handleChange("refinanceDate", e.target.value)
                      }
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nouvelle valeur marchande estimée
                    </label>
                    <FormattedNumberInput
                      value={scenario.newMarketValue}
                      onChange={(val) => handleChange("newMarketValue", val)}
                      className="w-full border rounded p-2"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Augmentation annuelle du revenu net (%)
                    </label>
                    <FormattedNumberInput
                      value={scenario.netIncomeGrowth}
                      onChange={(val) => handleChange("netIncomeGrowth", val)}
                      className="w-full border rounded p-2"
                      type="percentage"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      id="cashOut"
                      type="checkbox"
                      checked={scenario.cashOut}
                      onChange={(e) => handleChange("cashOut", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="cashOut" className="text-sm font-medium">
                      Retirer de l'équité (cash-out)
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Frais de refinancement ($)
                    </label>
                    <FormattedNumberInput
                      value={scenario.refinancingCosts}
                      onChange={(val) => handleChange("refinancingCosts", val)}
                      className="w-full border rounded p-2"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nouvelle mise de fonds
                    </label>
                    <FormattedNumberInput
                      value={scenario.newDownPayment}
                      onChange={() => {}}
                      className="w-full border rounded p-2"
                      placeholder="0"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            <FinancingSection
              financing={scenario.financing}
              onChange={handleFinancingChange}
              lockedFields={lockedFields}
            />

            <AcquisitionCosts
              costs={scenario.acquisitionCosts}
              onChange={handleCostsChange}
              advancedExpenses={advancedExpenses}
              analysis={{ acquisitionCosts: computeTotalCosts() }}
              lockedFields={lockedFields}
            />

            <div className="flex justify-end">
              {onSaved && (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

