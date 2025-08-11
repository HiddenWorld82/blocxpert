// components/BuildingDashboard.jsx
import React, { useState } from 'react';
import { Plus, Copy, Scale } from 'lucide-react';
import useBuilding from '../hooks/useBuilding';
import useScenarios from '../hooks/useScenarios';
import ScenarioManager from './ScenarioManager';
import TimelineView from './TimelineView';
import ScenarioComparison from './ScenarioComparison';

const BuildingDashboard = ({ buildingId }) => {
  const building = useBuilding(buildingId);
  const { scenarios, addScenario, cloneScenario } = useScenarios(buildingId);
  const [managerOpen, setManagerOpen] = useState(false);
  const [duplicateId, setDuplicateId] = useState(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonInitial, setComparisonInitial] = useState([]);

  const handleSave = async (data) => {
    if (duplicateId) {
      await cloneScenario(duplicateId, data);
    } else {
      await addScenario(data);
    }
    setManagerOpen(false);
    setDuplicateId(null);
  };

  const openComparison = (ids = []) => {
    setComparisonInitial(ids);
    setComparisonOpen(true);
  };

  if (!building) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{building.address}</h1>
      <div className="text-gray-700">
        <div>Revenus initiaux: {Number(building.annualRent || 0).toLocaleString('fr-CA')} $</div>
        <div>Dépenses initiales: {Number(building.operatingExpenses || 0).toLocaleString('fr-CA')} $</div>
      </div>

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => setManagerOpen(true)}
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
                onClick={() => {
                  setDuplicateId(s.id);
                  setManagerOpen(true);
                }}
              >
                <Copy className="w-4 h-4 mr-1" />Dupliquer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {managerOpen && (
        <ScenarioManager
          onClose={() => {
            setManagerOpen(false);
            setDuplicateId(null);
          }}
          onSave={handleSave}
          scenarios={scenarios}
          parentId={duplicateId}
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

