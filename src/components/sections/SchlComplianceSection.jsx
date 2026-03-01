import React from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getAphMaxLtvRatio } from "../../utils/cmhc";

const formatMoney = (value) =>
  value !== null && value !== undefined
    ? new Intl.NumberFormat("fr-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    : "—";

const formatPercent = (value, digits = 1) =>
  value !== null && value !== undefined
    ? `${new Intl.NumberFormat("fr-CA", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value)}%`
    : "—";

export default function SchlComplianceSection({ analysis, property }) {
  const { t, language } = useLanguage();
  if (!analysis || !property) return null;

  const { operatingExpensesSCHL, operatingExpensesTotal, loanValueRatio } = analysis;

  const hasSchlBenchmark = operatingExpensesSCHL > 0;
  const expensesRatio = hasSchlBenchmark
    ? operatingExpensesTotal / operatingExpensesSCHL
    : null;

  let expensesStatusKey = "schlCompliance.expensesWithin";
  if (expensesRatio !== null) {
    if (expensesRatio < 0.9) {
      expensesStatusKey = "schlCompliance.expensesBelow";
    } else if (expensesRatio > 1.1) {
      expensesStatusKey = "schlCompliance.expensesAbove";
    }
  }

  const expensesDiffPct =
    expensesRatio !== null ? (expensesRatio - 1) * 100 : null;

  const getProvinceLabel = (code) => {
    const map = {
      QC: "Québec",
      ON: "Ontario",
      NB: "Nouveau-Brunswick",
      NS: "Nouvelle-Écosse",
      PE: "Île-du-Prince-Édouard",
      NL: "Terre-Neuve-et-Labrador",
      MB: "Manitoba",
      SK: "Saskatchewan",
      AB: "Alberta",
      BC: "Colombie-Britannique",
      NT: "Territoires du Nord-Ouest",
      NU: "Nunavut",
      YT: "Yukon",
    };
    return map[code] || code || "";
  };

  const provinceLabel = getProvinceLabel(property.province);

  const financingType = property.financingType;
  const points = parseInt(property.aphPoints) || 0;
  const maxAphLtv =
    financingType === "cmhc_aph" ? getAphMaxLtvRatio(points) * 100 : null;
  const standardMaxLtv =
    financingType === "cmhc" || financingType === "cmhc_aph" ? 85 : null;

  const ltvUsed = loanValueRatio || 0;

  let ltvMax = null;
  let ltvLabelKey = null;
  if (financingType === "cmhc_aph") {
    ltvMax = maxAphLtv;
    ltvLabelKey = "schlCompliance.ltvAphLabel";
  } else if (financingType === "cmhc") {
    ltvMax = standardMaxLtv;
    ltvLabelKey = "schlCompliance.ltvStandardLabel";
  }

  let ltvStatusKey = null;
  if (ltvMax !== null) {
    ltvStatusKey =
      ltvUsed <= ltvMax
        ? "schlCompliance.status.ok"
        : "schlCompliance.status.tooHigh";
  }

  const renderExpenseMessage = () => {
    if (!hasSchlBenchmark || expensesDiffPct === null) return null;
    const diffAbs = Math.abs(expensesDiffPct).toFixed(1);
    if (language === "fr") {
      if (expensesRatio < 0.9) {
        return `Selon les barèmes SCHL pour ${provinceLabel}, vos dépenses d'exploitation sont environ ${diffAbs}% sous le niveau de référence. Cela peut être remis en question par le souscripteur si les hypothèses sont jugées trop optimistes.`;
      }
      if (expensesRatio > 1.1) {
        return `Selon les barèmes SCHL pour ${provinceLabel}, vos dépenses d'exploitation sont environ ${diffAbs}% au-dessus du niveau de référence. Cela renforce la prudence de votre scénario, mais réduit le NOI et la capacité d'emprunt.`;
      }
      return `Vos dépenses d'exploitation sont globalement alignées sur les barèmes SCHL pour ${provinceLabel}.`;
    }
    // en
    if (expensesRatio < 0.9) {
      return `According to CMHC benchmarks for ${provinceLabel}, your operating expenses are about ${diffAbs}% below the reference level. Underwriters may challenge these assumptions if they look too optimistic.`;
    }
    if (expensesRatio > 1.1) {
      return `According to CMHC benchmarks for ${provinceLabel}, your operating expenses are about ${diffAbs}% above the reference level. This is conservative but reduces NOI and borrowing capacity.`;
    }
    return `Your operating expenses are broadly aligned with CMHC benchmarks for ${provinceLabel}.`;
  };

  const renderLtvMessage = () => {
    if (ltvMax === null) return null;
    const diff = ltvUsed - ltvMax;
    const diffAbs = Math.abs(diff).toFixed(1);
    if (language === "fr") {
      if (diff <= 0) {
        return `Avec ${points} points APH, le ratio RPV maximal admissible est d'environ ${ltvMax.toFixed(
          1,
        )}%. Votre montage utilise un RPV d'environ ${ltvUsed.toFixed(
          1,
        )}%, ce qui demeure dans les balises.`;
      }
      return `Avec ${points} points APH, le ratio RPV maximal admissible est d'environ ${ltvMax.toFixed(
        1,
      )}%. Votre montage utilise un RPV d'environ ${ltvUsed.toFixed(
        1,
      )}%, soit environ ${diffAbs} points de pourcentage au-dessus du maximum typique. Le dossier pourrait devoir être ajusté (mise de fonds, valeur, structure).`;
    }
    // en
    if (diff <= 0) {
      return `With ${points} APH points, the maximum allowed LTV is around ${ltvMax.toFixed(
        1,
      )}%. Your structure uses an LTV of about ${ltvUsed.toFixed(
        1,
      )}%, which remains within typical limits.`;
    }
    return `With ${points} APH points, the maximum allowed LTV is around ${ltvMax.toFixed(
      1,
    )}%. Your structure uses an LTV of about ${ltvUsed.toFixed(
      1,
    )}%, roughly ${diffAbs} percentage points above the usual maximum. The file may need adjustments (down payment, value, structure).`;
  };

  if (!hasSchlBenchmark && ltvMax === null) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">
          {t("schlCompliance.title")}
        </h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        {hasSchlBenchmark && (
          <div>
            <p className="text-gray-600 mb-1">
              {t("schlCompliance.expensesLabel")}
            </p>
            <p className="font-semibold">
              {formatMoney(operatingExpensesTotal)}{" "}
              <span className="text-gray-500 text-xs">
                ({formatMoney(operatingExpensesSCHL)} SCHL)
              </span>
            </p>
            {expensesDiffPct !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {formatPercent(expensesDiffPct, 1)} vs barème —{" "}
                <span
                  className={
                    expensesStatusKey === "schlCompliance.expensesWithin"
                      ? "text-green-600 font-medium"
                      : expensesStatusKey === "schlCompliance.expensesBelow"
                      ? "text-orange-500 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {t(expensesStatusKey)}
                </span>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">{renderExpenseMessage()}</p>
          </div>
        )}
        {ltvMax !== null && (
          <div>
            <p className="text-gray-600 mb-1">
              {t(ltvLabelKey)}
            </p>
            <p className="font-semibold">
              {formatPercent(ltvUsed, 1)}{" "}
              <span className="text-gray-500 text-xs">
                (max ~{formatPercent(ltvMax, 1)})
              </span>
            </p>
            {ltvStatusKey && (
              <p className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    ltvStatusKey === "schlCompliance.status.ok"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {t(ltvStatusKey)}
                </span>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">{renderLtvMessage()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

