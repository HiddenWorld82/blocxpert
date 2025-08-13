import React, { useMemo } from "react";
import { Info, Home, DollarSign, TrendingUp, Briefcase, Building, Calculator } from 'lucide-react';
import FormattedNumberInput from "../FormattedNumberInput";
import useGooglePlacesAutocomplete from "../../hooks/useGooglePlacesAutocomplete";

export default function BasicInfo({
  property = {},
  onChange,
  advancedExpenses,
  readOnly = false,
}) {
  const handleChange = (field, value) => {
    onChange({ ...property, [field]: value });
  };

  const autocompleteOptions = useMemo(
    () => ({ componentRestrictions: { country: "ca" } }),
    []
  );

  const addressRef = useGooglePlacesAutocomplete(
    (place) => handleChange("address", place.formatted_address),
    autocompleteOptions
  );

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-blue-600 flex items-center"><Home className="w-5 h-5 mr-2" />Informations de base</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <input
          ref={addressRef}
          type="text"
          value={property.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
          placeholder="123 rue Example, Montréal"
          disabled={readOnly}
          readOnly={readOnly}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {advancedExpenses && (
          <div>
            <label className="block text-sm font-medium mb-1">Prix demandé</label>
            <FormattedNumberInput
              value={property.askingPrice || ""}
              onChange={(val) => handleChange("askingPrice", val)}
              className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
              placeholder="0"
              type="currency"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Prix d'achat</label>
          <FormattedNumberInput
            value={property.purchasePrice || ""}
            onChange={(val) => handleChange("purchasePrice", val)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="0"
            type="currency"
            disabled={readOnly}
            readOnly={readOnly}
          />
        </div>
        {advancedExpenses && (
          <div>
            <label className="block text-sm font-medium mb-1">Évaluation municipale</label>
            <FormattedNumberInput
              value={property.municipalEvaluation || ""}
              onChange={(val) => handleChange("municipalEvaluation", val)}
              className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
              placeholder="0"
              type="currency"
              disabled={readOnly}
              readOnly={readOnly}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre d'unités</label>
          <FormattedNumberInput
            value={property.numberOfUnits || ""}
            onChange={(val) => handleChange("numberOfUnits", val)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="0"
            disabled={readOnly}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
