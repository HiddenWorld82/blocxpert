import React, { useMemo, useRef } from "react";
import { Home } from "lucide-react";
import FormattedNumberInput from "../FormattedNumberInput";
import useGooglePlacesAutocomplete from "../../hooks/useGooglePlacesAutocomplete";
import { useLanguage } from "../../contexts/LanguageContext";

export default function BasicInfo({
  property = {},
  onChange,
  advancedExpenses,
  readOnly = false,
  disablePlaceAutocomplete = false,
  purchasePriceLabel,
}) {
  const { t } = useLanguage();
  const purchaseLabel = purchasePriceLabel || t("basicInfo.purchasePrice");
  const handleChange = (field, value) => {
    onChange({ ...property, [field]: value });
  };

  const autocompleteOptions = useMemo(
    () => ({
      componentRestrictions: { country: "ca" },
      fields: ["address_components"],
    }),
    []
  );

  const addressRef = disablePlaceAutocomplete
    ? useRef(null)
    : useGooglePlacesAutocomplete(
        (place) => {
          const components = place.address_components || [];
          const get = (type, short = false) => {
            const comp = components.find((c) => c.types.includes(type));
            if (!comp) return "";
            return short ? comp.short_name : comp.long_name;
          };
          const street = [get("street_number"), get("route")]
            .filter(Boolean)
            .join(" ");
          const city =
            get("locality") ||
            get("administrative_area_level_2") ||
            get("sublocality") ||
            get("postal_town");
          onChange({
            ...property,
            address: street,
            city,
            province: get("administrative_area_level_1", true),
            postalCode: get("postal_code"),
          });
        },
        autocompleteOptions
      );

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-blue-600 flex items-center">
        <Home className="w-5 h-5 mr-2" />
        {t("basicInfo.title")}
      </h2>
      <div>
        <label className="block text-sm font-medium mb-1">{t("basicInfo.address")}</label>
        <input
          ref={addressRef}
          type="text"
          value={property.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
          placeholder="123 Example St"
          disabled={readOnly}
          readOnly={readOnly}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("basicInfo.city")}</label>
          <input
            type="text"
            value={property.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="Montreal"
            disabled={readOnly}
            readOnly={readOnly}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("basicInfo.province")}</label>
          <input
            type="text"
            value={property.province || ""}
            onChange={(e) => handleChange("province", e.target.value)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="QC"
            disabled={readOnly}
            readOnly={readOnly}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("basicInfo.postalCode")}</label>
          <input
            type="text"
            value={property.postalCode || ""}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="H2B 1A0"
            disabled={readOnly}
            readOnly={readOnly}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {advancedExpenses && (
          <div>
            <label className="block text-sm font-medium mb-1">{t("basicInfo.askingPrice")}</label>
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
          <label className="block text-sm font-medium mb-1">{purchaseLabel}</label>
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
            <label className="block text-sm font-medium mb-1">{t("basicInfo.municipalEvaluation")}</label>
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
          <label className="block text-sm font-medium mb-1">{t("basicInfo.numberOfUnits")}</label>
          <FormattedNumberInput
            value={property.numberOfUnits || ""}
            onChange={(val) => handleChange("numberOfUnits", val)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            placeholder="0"
            disabled={readOnly}
            readOnly={readOnly}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("basicInfo.structureType")}</label>
          <select
            value={property.structureType || 'woodFrame'}
            onChange={(e) => handleChange('structureType', e.target.value)}
            className={`w-full border rounded p-2 ${readOnly ? 'bg-gray-100' : ''}`}
            disabled={readOnly}
          >
            <option value="woodFrame">{t("basicInfo.structureType.woodFrame")}</option>
            <option value="concrete">{t("basicInfo.structureType.concrete")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
