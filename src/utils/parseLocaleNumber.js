export default function parseLocaleNumber(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return value.toString();
  return value.toString().replace(/[\s$%]/g, "").replace(",", ".");
}
