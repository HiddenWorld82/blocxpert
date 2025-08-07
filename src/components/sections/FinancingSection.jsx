// src/components/sections/FinancingSection.jsx
import React from "react";

export default function FinancingSection({ financing = {}, onChange, lockedFields = {}, setLockedFields }) {
  const handleChange = (field, value) => {
    onChange({ ...financing, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Financement</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Type de financement</label>
        <select
          value={financing.financingType || "conventional"}
          onChange={(e) => handleChange("financingType", e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="conventional">Conventionnel</option>
          <option value="cmhc">SCHL Standard</option>
          <option value="cmhc_aph">SCHL APH Select</option>
        </select>
      </div>
      
      {financing.financingType === "cmhc_aph" && (
        <div>
          <label className="block text-sm font-medium mb-1">Points APH</label>
          <input
            type="number"
            value={financing.aphPoints || ""}
            onChange={(e) => handleChange("aphPoints", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="0"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Taux d'intérêt (%)</label>
          <input
            type="number"
            step="0.1"
            value={financing.mortgageRate || ""}
            onChange={(e) => handleChange("mortgageRate", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="5.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amortissement (années)</label>
          <input
            type="number"
            value={financing.amortization || ""}
            onChange={(e) => handleChange("amortization", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Terme (années)</label>
          <select
            value={financing.term || ""}
            onChange={(e) => handleChange("term", e.target.value)}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Taux de qualification (%)</label>
          <input
            type="number"
            step="0.1"
            value={financing.qualificationRate || ""}
            onChange={(e) => handleChange("qualificationRate", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="6.0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ratio couverture dette</label>
          <input
            type="number"
            step="0.01"
            value={financing.debtCoverageRatio || ""}
            onChange={(e) => handleChange("debtCoverageRatio", e.target.value)}
            className="w-full border rounded p-2"
            placeholder="1.15"
            disabled={lockedFields?.debtCoverage}
          />
        </div>
      </div>
    </div>
  );
}