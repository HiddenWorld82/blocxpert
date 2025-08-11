// components/ScenarioEditor.jsx
import React, { useEffect, useState } from 'react';
import FinancingSection from './sections/FinancingSection';
import AcquisitionCosts from './sections/AcquisitionCosts';
import BasicInfo from './sections/BasicInfo';
import RevenueSection from './sections/RevenueSection';
import OperatingExpensesSection from './sections/OperatingExpensesSection';

const ScenarioEditor = ({
  currentScenario,
  setCurrentScenario,
  lockedFields = {},
  setLockedFields = () => {},
  setCurrentStep,
  analysis = {},
  advancedExpenses = false,
  setAdvancedExpenses = () => {},
  parentScenario = null,
  onSave,
  onCancel
}) => {
  const [scenarioType, setScenarioType] = useState(
    currentScenario.type || 'achat initial'
  );
  const [year, setYear] = useState(
    currentScenario.year || new Date().getFullYear()
  );

  useEffect(() => {
    setCurrentScenario((prev) => ({ ...prev, type: scenarioType }));
  }, [scenarioType, setCurrentScenario]);

  useEffect(() => {
    setCurrentScenario((prev) => ({ ...prev, year }));
  }, [year, setCurrentScenario]);

  useEffect(() => {
    if (
      (scenarioType === 'refinancement' || scenarioType === 'rénovation') &&
      parentScenario
    ) {
      const { id, ...rest } = parentScenario;
      setCurrentScenario({ ...rest, type: scenarioType, year });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioType, parentScenario]);

  const handleCancel = () => {
    if (onCancel) onCancel();
    else setCurrentStep && setCurrentStep('home');
  };

  const handleSave = () => {
    if (onSave) onSave();
    else setCurrentStep && setCurrentStep('report');
  };

  const saveLabel = onSave ? 'Enregistrer' : "Générer l'analyse";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Nouvelle Analyse d'Immeuble</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAdvancedExpenses(!advancedExpenses)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {advancedExpenses ? 'Mode simplifié' : 'Mode avancé'}
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Retour
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">
                Type de scénario
              </label>
              <select
                className="w-full border rounded p-2"
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
              >
                <option value="achat initial">achat initial</option>
                <option value="refinancement">refinancement</option>
                <option value="rénovation">rénovation</option>
                <option value="optimisation">optimisation</option>
                <option value="vente">vente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Année d'application
              </label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-8">
            <BasicInfo
              property={currentScenario}
              onChange={setCurrentScenario}
              advancedExpenses={advancedExpenses}
            />
            <RevenueSection
              revenue={currentScenario}
              onChange={setCurrentScenario}
              advancedExpenses={advancedExpenses}
            />
            <OperatingExpensesSection
              expenses={currentScenario}
              onChange={setCurrentScenario}
              advancedExpenses={advancedExpenses}
            />
            <FinancingSection
              financing={currentScenario}
              onChange={setCurrentScenario}
              lockedFields={lockedFields}
              setLockedFields={setLockedFields}
              analysis={analysis}
            />
            <AcquisitionCosts
              costs={currentScenario}
              onChange={setCurrentScenario}
              lockedFields={lockedFields}
              analysis={analysis}
              advancedExpenses={advancedExpenses}
            />

            {scenarioType === 'rénovation' && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Impact des rénovations
                </h3>
                <textarea
                  className="w-full border rounded p-2"
                  value={currentScenario.renovationImpact || ''}
                  onChange={(e) =>
                    setCurrentScenario((prev) => ({
                      ...prev,
                      renovationImpact: e.target.value
                    }))
                  }
                  placeholder="Décrivez l'impact des rénovations"
                />
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {saveLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioEditor;
