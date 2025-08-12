import React, { useEffect, useState } from "react";
import { getScenarios, duplicateScenario } from "../services/dataService";

const typeLabels = {
  initialFinancing: "Financement initial",
  refinancing: "Refinancement",
  renovation: "Rénovation",
  other: "Autres",
};

export default function ScenarioList({ propertyId, onEdit }) {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    if (!propertyId) return;
    const unsub = getScenarios(propertyId, setScenarios);
    return () => unsub && unsub();
  }, [propertyId]);

  const handleDuplicate = async (scenario) => {
    await duplicateScenario(propertyId, scenario);
  };

  const grouped = scenarios.reduce((acc, sc) => {
    const type = sc.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(sc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, list]) => (
        <div key={type}>
          <h3 className="text-lg font-semibold mb-2">{typeLabels[type] || type}</h3>
          <div className="space-y-2">
            {list.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-2 bg-white rounded shadow"
              >
                <span>{s.title || "Sans titre"}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit && onEdit(s)}
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDuplicate(s)}
                    className="text-green-600 hover:underline"
                  >
                    Dupliquer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
