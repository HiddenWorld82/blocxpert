import React, { useEffect, useState } from "react";
import {
  getScenarios,
  duplicateScenario,
  deleteScenario,
} from "../services/dataService";

const typeLabels = {
  initialFinancing: "Financement initial",
  refinancing: "Refinancement",
  renewal: "Renouvellement hypothécaire",
  optimization: "Optimisation",
  other: "Autres",
};

export default function ScenarioList({ propertyId, onEdit, onView, excludeTypes = [] }) {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    if (!propertyId) return;
    const unsub = getScenarios(propertyId, setScenarios);
    return () => unsub && unsub();
  }, [propertyId]);

  const handleDuplicate = async (scenario) => {
    // Firestore's onSnapshot listener in `getScenarios` already updates the
    // state when a new scenario is created. Adding the duplicated scenario to
    // the local state here caused it to appear twice and produced React's
    // "Encountered two children with the same key" warning. We only trigger
    // the duplication in the database and let the listener refresh the list.
    await duplicateScenario(propertyId, scenario);
  };

  const handleDelete = async (id) => {
    await deleteScenario(propertyId, id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = scenarios.filter(
    (s) => !excludeTypes.includes(s.type || "other")
  );

  // If initial financing scenarios are excluded, render a flat list (for child scenarios only)
  if (excludeTypes.includes("initialFinancing")) {
    const grouped = filtered.reduce((acc, sc) => {
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
                    {onView && (
                      <button
                        onClick={() => onView(s)}
                        className="text-indigo-600 hover:underline"
                      >
                        Voir le rapport
                      </button>
                    )}
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
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
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

  // Hierarchical rendering: initial financing scenarios with their child scenarios
  const initialScenarios = filtered.filter((s) => s.type === "initialFinancing");

  return (
    <div className="space-y-6">
      {initialScenarios.map((init) => {
        const children = filtered.filter(
          (c) => c.parentScenarioId === init.id && c.id !== init.id
        );
        return (
          <div key={init.id} className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded shadow">
              <span>{init.title || "Sans titre"}</span>
              <div className="flex gap-2">
                {onView && (
                  <button
                    onClick={() => onView(init)}
                    className="text-indigo-600 hover:underline"
                  >
                    Voir le rapport
                  </button>
                )}
                <button
                  onClick={() => onEdit && onEdit(init)}
                  className="text-blue-600 hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDuplicate(init)}
                  className="text-green-600 hover:underline"
                >
                  Dupliquer
                </button>
                <button
                  onClick={() => handleDelete(init.id)}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
            {children.length > 0 && (
              <div className="pl-4 space-y-2">
                {children.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded shadow"
                  >
                    <span>
                      {s.title || "Sans titre"} (
                      {typeLabels[s.type] || s.type})
                    </span>
                    <div className="flex gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(s)}
                          className="text-indigo-600 hover:underline"
                        >
                          Voir le rapport
                        </button>
                      )}
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
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
