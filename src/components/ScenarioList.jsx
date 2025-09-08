import React, { useEffect, useState } from "react";
import {
  getScenarios,
  duplicateScenario,
  deleteScenario,
} from "../services/dataService";
import { Eye, Pencil, Copy, Trash2 } from "lucide-react";

const typeLabels = {
  initialFinancing: "Financement initial",
  refinancing: "Refinancement",
  renewal: "Renouvellement hypothécaire",
  optimization: "Optimisation",
  other: "Autres",
};

export default function ScenarioList({
  propertyId,
  onEdit,
  onView,
  excludeTypes = [],
  parentScenarioId = null,
}) {
  const [scenarios, setScenarios] = useState([]);

  const ActionButton = ({ label, icon: Icon, onClick, className }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5" />
      <span className="sr-only">{label}</span>
    </button>
  );

  useEffect(() => {
    if (!propertyId) return;
    const unsub = getScenarios(propertyId, setScenarios, parentScenarioId);
    return () => unsub && unsub();
  }, [propertyId, parentScenarioId]);

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

  const filtered = scenarios.filter((s) => {
    if (excludeTypes.includes(s.type || "other")) return false;
    if (parentScenarioId != null && s.parentScenarioId !== parentScenarioId) {
      return false;
    }
    return true;
  });

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
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-white rounded shadow"
                >
                  <span>{s.title || "Sans titre"}</span>
                  <div className="flex gap-2">
                    {onView && (
                      <ActionButton
                        label="Voir le rapport"
                        icon={Eye}
                        onClick={() => onView(s)}
                        className="text-indigo-600 hover:text-indigo-800"
                      />
                    )}
                    <ActionButton
                      label="Modifier"
                      icon={Pencil}
                      onClick={() => onEdit && onEdit(s)}
                      className="text-blue-600 hover:text-blue-800"
                    />
                    <ActionButton
                      label="Dupliquer"
                      icon={Copy}
                      onClick={() => handleDuplicate(s)}
                      className="text-green-600 hover:text-green-800"
                    />
                    <ActionButton
                      label="Supprimer"
                      icon={Trash2}
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:text-red-800"
                    />
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-white rounded shadow">
              <span>{init.title || "Sans titre"}</span>
              <div className="flex gap-2">
                {onView && (
                  <ActionButton
                    label="Voir le rapport"
                    icon={Eye}
                    onClick={() => onView(init)}
                    className="text-indigo-600 hover:text-indigo-800"
                  />
                )}
                <ActionButton
                  label="Modifier"
                  icon={Pencil}
                  onClick={() => onEdit && onEdit(init)}
                  className="text-blue-600 hover:text-blue-800"
                />
                <ActionButton
                  label="Dupliquer"
                  icon={Copy}
                  onClick={() => handleDuplicate(init)}
                  className="text-green-600 hover:text-green-800"
                />
                <ActionButton
                  label="Supprimer"
                  icon={Trash2}
                  onClick={() => handleDelete(init.id)}
                  className="text-red-600 hover:text-red-800"
                />
              </div>
            </div>
            {children.length > 0 && (
              <div className="sm:pl-4 space-y-2">
                {children.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-gray-50 rounded shadow"
                  >
                    <span>
                      {s.title || "Sans titre"} (
                      {typeLabels[s.type] || s.type})
                    </span>
                    <div className="flex gap-2">
                      {onView && (
                        <ActionButton
                          label="Voir le rapport"
                          icon={Eye}
                          onClick={() => onView(s)}
                          className="text-indigo-600 hover:text-indigo-800"
                        />
                      )}
                      <ActionButton
                        label="Modifier"
                        icon={Pencil}
                        onClick={() => onEdit && onEdit(s)}
                        className="text-blue-600 hover:text-blue-800"
                      />
                      <ActionButton
                        label="Dupliquer"
                        icon={Copy}
                        onClick={() => handleDuplicate(s)}
                        className="text-green-600 hover:text-green-800"
                      />
                      <ActionButton
                        label="Supprimer"
                        icon={Trash2}
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 hover:text-red-800"
                      />
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
