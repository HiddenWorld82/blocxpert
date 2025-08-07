import React from "react";

const formatNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return "";
  }
  return new Intl.NumberFormat("fr-CA").format(number);
};

export default function FormattedNumberInput({ value, onChange, ...props }) {
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\s/g, "").replace(",", ".");
    if (/^\d*\.?\d*$/.test(rawValue)) {
      onChange(rawValue);
    }
  };

  return (
    <input type="text" value={formatNumber(value)} onChange={handleChange} {...props} />
  );
}

