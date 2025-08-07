import React, { useState, useEffect } from "react";

export function parseLocaleNumber(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return value.toString();
  return value.toString().replace(/[\s$%]/g, "").replace(",", ".");
}

export function formatCurrency(value) {
  const str = parseLocaleNumber(value);
  if (str === "") return "";
  const number = Number(str);
  if (Number.isNaN(number)) return "";
  return (
    new Intl.NumberFormat("fr-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number) + " $"
  );
}

export function formatPercentage(value) {
  const str = parseLocaleNumber(value);
  if (str === "") return "";
  const number = Number(str);
  if (Number.isNaN(number)) return "";
  return (
    new Intl.NumberFormat("fr-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number) + " %"
  );
}

export default function FormattedNumberInput({ value, onChange, type, ...props }) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    const str = parseLocaleNumber(value);
    if (str === "") {
      setDisplayValue("");
      return;
    }
    if (type === "currency") {
      setDisplayValue(formatCurrency(str));
    } else if (type === "percentage") {
      setDisplayValue(formatPercentage(str));
    } else {
      const number = Number(str);
      if (Number.isNaN(number)) {
        setDisplayValue("");
      } else {
        setDisplayValue(new Intl.NumberFormat("fr-CA").format(number));
      }
    }
  }, [value, type]);

  const handleChange = (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^\d.,-]/g, "");
    setDisplayValue(cleaned);
    onChange(parseLocaleNumber(cleaned));
  };

  const handleFocus = () => {
    setDisplayValue(parseLocaleNumber(displayValue));
  };

  const handleBlur = () => {
    const numeric = parseLocaleNumber(displayValue);
    let formatted = numeric;
    if (type === "currency") {
      formatted = formatCurrency(numeric);
    } else if (type === "percentage") {
      formatted = formatPercentage(numeric);
    } else {
      formatted = numeric.replace(".", ",");
    }
    setDisplayValue(formatted);
    onChange(numeric);
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}

