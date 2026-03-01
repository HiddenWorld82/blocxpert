import React, { useEffect, useState } from "react";
import {
  getScenarios,
  duplicateScenario,
  deleteScenario,
} from "../services/dataService";
import {
  getShareScenarios,
  saveShareScenario,
  duplicateShareScenario,
  deleteShareScenario,
} from "../services/shareService";
import { Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import KeyIndicators from "./sections/KeyIndicators";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSummary from "./sections/FinancingSummary";

export default function ScenarioList({
  propertyId,
  shareToken = null,
  baseScenarios = null,
  shareCreatorInfo = null,
  shareFilterByCreatorUid = null,
  onEdit,
  onView,
  excludeTypes = [],
  parentScenarioId = null,
  selectedSubScenarioId = null,
  expandedContent = null,
  editingScenarioId = null,
  renderEditForm = null,
}) {
  const { t } = useLanguage();
  const [scenarios, setScenarios] = useState([]);
  const [shareScenarios, setShareScenarios] = useState([]);
  const filteredShareScenarios =
    shareToken && shareFilterByCreatorUid
      ? shareScenarios.filter((s) => !s.createdByUid || s.createdByUid === shareFilterByCreatorUid)
      : shareScenarios;

  const typeLabels = {
    initialFinancing: t("scenario.initialFinancing"),
    refinancing: t("scenario.refinancing"),
    renewal: t("scenario.renewal"),
    optimization: t("scenario.optimization"),
    other: t("scenario.other"),
  };

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
    if (shareToken) {
      const unsub = getShareScenarios(shareToken, setShareScenarios, parentScenarioId);
      return () => {
        const u = unsub;
        queueMicrotask(() => u?.());
      };
    }
    if (!propertyId) return;
    const unsub = getScenarios(propertyId, setScenarios, parentScenarioId);
    return () => {
      const u = unsub;
      queueMicrotask(() => u?.());
    };
  }, [propertyId, shareToken, parentScenarioId]);

  const isShareMode = Boolean(shareToken);
  const mergedScenarios = isShareMode
    ? [...(baseScenarios || []).map((s) => ({ ...s, _fromSnapshot: true })), ...filteredShareScenarios]
    : scenarios;

  const handleDuplicate = async (scenario) => {
    if (isShareMode) {
      if (scenario._fromSnapshot) {
        const { _fromSnapshot, ...data } = scenario;
        await saveShareScenario(shareToken, data, shareCreatorInfo);
      } else {
        await duplicateShareScenario(shareToken, scenario, shareCreatorInfo);
      }
      return;
    }
    await duplicateScenario(propertyId, scenario);
  };

  const handleDelete = async (id) => {
    if (isShareMode) {
      await deleteShareScenario(shareToken, id);
      return;
    }
    await deleteScenario(propertyId, id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = mergedScenarios.filter((s) => {
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
                <div key={s.id} className="rounded shadow overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-white">
                    <span>{s.title || t('propertyReport.untitled')}</span>
                    <div className="flex gap-2">
                      {onView && (
                        <ActionButton
                          label={t('scenarioList.viewReport')}
                          icon={Eye}
                          onClick={() => onView(s)}
                          className="text-indigo-600 hover:text-indigo-800"
                        />
                      )}
                      {!s._fromSnapshot && onEdit && (
                        <ActionButton
                          label={t('scenarioList.edit')}
                          icon={Pencil}
                          onClick={() => onEdit(s)}
                          className="text-blue-600 hover:text-blue-800"
                        />
                      )}
                      <ActionButton
                        label={t('scenarioList.duplicate')}
                        icon={Copy}
                        onClick={() => handleDuplicate(s)}
                        className="text-green-600 hover:text-green-800"
                      />
                      {!s._fromSnapshot && (
                        <ActionButton
                          label={t('scenarioList.delete')}
                          icon={Trash2}
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-800"
                        />
                      )}
                    </div>
                  </div>
                  {s.id === selectedSubScenarioId && expandedContent?.analysis && !editingScenarioId && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <KeyIndicators
                        analysis={expandedContent.analysis}
                        variant={
                          expandedContent.property?.financingType === "private"
                            ? "private"
                            : "acquisition"
                        }
                        exclude={expandedContent.scenarioType === "renewal" ? ["mrb", "mrn", "tga"] : []}
                      />
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <FinancialSummary
                          analysis={expandedContent.analysis}
                          advancedExpenses={expandedContent.advancedExpenses}
                        />
                        <FinancingSummary
                          analysis={expandedContent.analysis}
                          currentProperty={expandedContent.property}
                          financing={expandedContent.property}
                          scenarioType={expandedContent.scenarioType || "refinancing"}
                        />
                      </div>
                    </div>
                  )}
                  {s.id === editingScenarioId && typeof renderEditForm === "function" && (
                    <div className="border-t border-gray-200">
                      {renderEditForm()}
                    </div>
                  )}
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
              <span>{init.title || t('propertyReport.untitled')}</span>
              <div className="flex gap-2">
                {onView && (
                  <ActionButton
                    label={t('scenarioList.viewReport')}
                    icon={Eye}
                    onClick={() => onView(init)}
                    className="text-indigo-600 hover:text-indigo-800"
                  />
                )}
                {!init._fromSnapshot && onEdit && (
                  <ActionButton
                    label={t('scenarioList.edit')}
                    icon={Pencil}
                    onClick={() => onEdit(init)}
                    className="text-blue-600 hover:text-blue-800"
                  />
                )}
                <ActionButton
                  label={t('scenarioList.duplicate')}
                  icon={Copy}
                  onClick={() => handleDuplicate(init)}
                  className="text-green-600 hover:text-green-800"
                />
                {!init._fromSnapshot && (
                  <ActionButton
                    label={t('scenarioList.delete')}
                    icon={Trash2}
                    onClick={() => handleDelete(init.id)}
                    className="text-red-600 hover:text-red-800"
                  />
                )}
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
                      {s.title || t('propertyReport.untitled')} (
                      {typeLabels[s.type] || s.type})
                    </span>
                    <div className="flex gap-2">
                      {onView && (
                        <ActionButton
                          label={t('scenarioList.viewReport')}
                          icon={Eye}
                          onClick={() => onView(s)}
                          className="text-indigo-600 hover:text-indigo-800"
                        />
                      )}
                {!s._fromSnapshot && onEdit && (
                  <ActionButton
                    label={t('scenarioList.edit')}
                    icon={Pencil}
                    onClick={() => onEdit(s)}
                    className="text-blue-600 hover:text-blue-800"
                  />
                )}
                      <ActionButton
                        label={t('scenarioList.duplicate')}
                        icon={Copy}
                        onClick={() => handleDuplicate(s)}
                        className="text-green-600 hover:text-green-800"
                      />
                      {!s._fromSnapshot && (
                        <ActionButton
                          label={t('scenarioList.delete')}
                          icon={Trash2}
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-800"
                        />
                      )}
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
