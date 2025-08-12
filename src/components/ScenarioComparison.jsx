// components/ScenarioComparison.jsx
import React from 'react';
import useComparison from '../hooks/useComparison';

const labels = {
  cashFlow: 'Cash-flow',
  roi: 'ROI',
  netWorth: 'Valeur nette',
};

const ScenarioComparison = ({ scenarios = [], onClose, initialSelected = [] }) => {
  const {
    selected,
    selectedScenarios,
    metrics,
    toggleScenario,
    exportPDF,
  } = useComparison(scenarios, initialSelected);

  const metricKeys = Object.keys(labels);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6">
        <h2 className="text-xl font-bold mb-4">Comparer des scénarios</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {scenarios.map((s) => (
            <label key={s.id} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => toggleScenario(s.id)}
                disabled={!selected.includes(s.id) && selected.length >= 4}
              />
              {s.name || s.id}
            </label>
          ))}
        </div>

        {selectedScenarios.length >= 2 && (
          <div>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scénario</th>
                  {metricKeys.map((m) => (
                    <th key={m} className="text-left p-2">{labels[m]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedScenarios.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 font-medium">{s.name || s.id}</td>
                    {metricKeys.map((m) => (
                      <td key={m} className="p-2">
                        {s[m] !== undefined ? s[m] : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="font-semibold mb-2">
              Différences vs {selectedScenarios[0].name || selectedScenarios[0].id}
            </h3>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scénario</th>
                  {metricKeys.map((m) => (
                    <th key={m} className="text-left p-2">{labels[m]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedScenarios.slice(1).map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 font-medium">{s.name || s.id}</td>
                    {metricKeys.map((m) => (
                      <td key={m} className="p-2">
                        {metrics[s.id]?.[m] !== undefined
                          ? metrics[s.id][m]
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {metricKeys.map((metric) => {
                const max = Math.max(
                  ...selectedScenarios.map((s) => Number(s[metric]) || 0),
                  1
                );
                return (
                  <div key={metric}>
                    <h3 className="font-semibold mb-2">{labels[metric]}</h3>
                    {selectedScenarios.map((s) => (
                      <div key={s.id} className="mb-2">
                        <div className="text-xs mb-1">{s.name || s.id}</div>
                        <div className="h-2 bg-gray-200">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${((Number(s[metric]) || 0) / max) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Fermer
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={exportPDF}
            disabled={selectedScenarios.length < 2}
          >
            Exporter PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;

