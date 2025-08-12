// components/BuildingDashboard.jsx
import React, { useState } from 'react';
import { Plus, Copy, Scale, Trash } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useBuilding from '../hooks/useBuilding';
import useScenarios from '../hooks/useScenarios';
import useRentabilityCalculator from '../hooks/useRentabilityCalculator';
import defaultProperty from '../defaults/defaultProperty';
import ScenarioEditor from './ScenarioEditor';
import TimelineView from './TimelineView';
import ScenarioComparison from './ScenarioComparison';

const BuildingDashboard = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { building, deleteBuilding } = useBuilding(buildingId);
  const { scenarios, deleteScenario } = useScenarios(buildingId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [parentScenario, setParentScenario] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(defaultProperty);
  const [advancedExpenses, setAdvancedExpenses] = useState(false);
  const [lockedFields, setLockedFields] = useState({
    debtCoverage: true,
    welcomeTax: true
  });
  const analysis = useRentabilityCalculator(
    currentScenario,
    advancedExpenses,
    lockedFields,
    setCurrentScenario
  );
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonInitial, setComparisonInitial] = useState([]);

  const openEditor = (parent = null) => {
    setParentScenario(parent);
    if (parent) {
      const { id, ...rest } = parent;
      setCurrentScenario({ ...rest });
    } else {
      setCurrentScenario(defaultProperty);
    }
    setEditorOpen(true);
  };

  const openComparison = (ids = []) => {
    setComparisonInitial(ids);
    setComparisonOpen(true);
  };

  if (!building) {
    return <div className="p-4">Chargement...</div>;
  }

  const handleDeleteBuilding = async () => {
    await deleteBuilding();
    navigate('/');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold flex justify-between items-center">
        {building.address}
        <button
          className="text-red-600 p-1"
          onClick={handleDeleteBuilding}
        >
          <Trash className="w-4 h-4" />
        </button>
      </h1>
      <div className="text-gray-700">
        <div>Revenus initiaux: {Number(building.annualRent || 0).toLocaleString('fr-CA')} $</div>
        <div>Dépenses initiales: {Number(building.operatingExpenses || 0).toLocaleString('fr-CA')} $</div>
      </div>

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => openEditor()}
        >
          <Plus className="w-4 h-4 mr-1" /> Nouveau scénario
        </button>
        <button
          className="bg-gray-100 px-4 py-2 rounded flex items-center"
          onClick={() => openComparison()}
        >
          <Scale className="w-4 h-4 mr-1" />Comparer
        </button>
      </div>

      <TimelineView scenarios={scenarios} />

      <ul className="divide-y">
        {scenarios.map((s) => (
          <li key={s.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{s.name || s.type || 'Scénario'}</div>
              <div className="text-sm text-gray-500">
                ENI: {s.effectiveNetIncome ? `${Math.round(s.effectiveNetIncome).toLocaleString('fr-CA')} $` : 'N/A'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm text-blue-600 flex items-center"
                onClick={() => openComparison([s.id])}
              >
                <Scale className="w-4 h-4 mr-1" />Comparer
              </button>
              <button
                className="text-sm text-green-600 flex items-center"
                onClick={() => openEditor(s)}
              >
                <Copy className="w-4 h-4 mr-1" />Dupliquer
              </button>
              <button
                className="text-sm text-red-600 flex items-center"
                onClick={() => deleteScenario(s.id)}
              >
                <Trash className="w-4 h-4 mr-1" />Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editorOpen && (
        <ScenarioEditor
          buildingId={buildingId}
          currentScenario={currentScenario}
          setCurrentScenario={setCurrentScenario}
          lockedFields={lockedFields}
          setLockedFields={setLockedFields}
          analysis={analysis}
          advancedExpenses={advancedExpenses}
          setAdvancedExpenses={setAdvancedExpenses}
          parentScenario={parentScenario}
          onCancel={() => {
            setEditorOpen(false);
            setParentScenario(null);
          }}
          onSave={() => {
            setEditorOpen(false);
            setParentScenario(null);
          }}
        />
      )}

      {comparisonOpen && (
        <ScenarioComparison
          scenarios={scenarios}
          initialSelected={comparisonInitial}
          onClose={() => {
            setComparisonOpen(false);
            setComparisonInitial([]);
          }}
        />
      )}
    </div>
  );
};

export default BuildingDashboard;

