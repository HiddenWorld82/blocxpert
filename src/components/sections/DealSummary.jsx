import React from "react";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const formatPercent = (value, digits = 1) =>
  value !== null && value !== undefined
    ? `${new Intl.NumberFormat("fr-CA", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value)}%`
    : "—";

const formatMoney = (value) =>
  value !== null && value !== undefined
    ? new Intl.NumberFormat("fr-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    : "—";

export default function DealSummary({ analysis, property }) {
  const { t, language } = useLanguage();
  if (!analysis || !property) return null;

  const capRate = analysis.capRate ?? 0;
  const coc = analysis.cashOnCashReturn ?? 0;
  const dscr = analysis.actualDebtCoverageRatio ?? 0;
  const ltv = analysis.loanValueRatio ?? 0;
  const cashFlow = analysis.cashFlow ?? 0;
  const totalReturn = analysis.totalReturn ?? 0;

  const financingType = property.financingType;

  const strongConditions = [
    capRate >= 5,
    coc >= 8,
    cashFlow >= 0,
    dscr >= 1.15,
    financingType === "private" ? ltv <= 75 : ltv <= 85,
  ];

  const weakConditions = [
    capRate < 4,
    coc < 4,
    cashFlow < 0,
    dscr < 1,
    ltv > 90,
  ];

  let verdict = "medium";
  if (strongConditions.filter(Boolean).length >= 4) {
    verdict = "strong";
  } else if (weakConditions.filter(Boolean).length >= 2) {
    verdict = "weak";
  }

  const strengths = [];
  const risks = [];

  if (capRate >= 5) {
    strengths.push(
      language === "fr"
        ? `TGA compétitif de ${formatPercent(capRate)}.`
        : `Attractive cap rate of ${formatPercent(capRate)}.`,
    );
  } else if (capRate < 4) {
    risks.push(
      language === "fr"
        ? `TGA faible de ${formatPercent(
            capRate,
          )}, nécessitant généralement une forte optimisation des revenus ou une négociation du prix.`
        : `Low cap rate of ${formatPercent(
            capRate,
          )}, usually requiring strong income optimization or price negotiation.`,
    );
  }

  if (cashFlow > 0) {
    strengths.push(
      language === "fr"
        ? `Cashflow positif d’environ ${formatMoney(
            cashFlow,
          )} par année, après service de la dette.`
        : `Positive annual cash flow of about ${formatMoney(
            cashFlow,
          )} after debt service.`,
    );
  } else if (cashFlow < 0) {
    risks.push(
      language === "fr"
        ? `Cashflow négatif d’environ ${formatMoney(
            cashFlow,
          )} par année : l’immeuble ne s’autofinance pas dans ce scénario.`
        : `Negative annual cash flow of about ${formatMoney(
            cashFlow,
          )}: the property does not self-finance under this scenario.`,
    );
  }

  if (coc >= 8) {
    strengths.push(
      language === "fr"
        ? `Rendement cash-on-cash intéressant de ${formatPercent(coc)}.`
        : `Attractive cash-on-cash return of ${formatPercent(coc)}.`,
    );
  } else if (coc < 4) {
    risks.push(
      language === "fr"
        ? `Rendement cash-on-cash limité de ${formatPercent(
            coc,
          )}, à comparer avec d’autres opportunités.`
        : `Limited cash-on-cash return of ${formatPercent(
            coc,
          )}, to be compared with alternative opportunities.`,
    );
  }

  if (dscr >= 1.15) {
    strengths.push(
      language === "fr"
        ? `Ratio couverture de dette (RCD) d’environ ${dscr.toFixed(
            2,
          )}, généralement acceptable pour plusieurs prêteurs.`
        : `Debt service coverage ratio (DSCR) around ${dscr.toFixed(
            2,
          )}, generally acceptable for many lenders.`,
    );
  } else if (dscr < 1.0) {
    risks.push(
      language === "fr"
        ? `RCD d’environ ${dscr.toFixed(
            2,
          )}, sous le seuil habituel de plusieurs prêteurs.`
        : `DSCR around ${dscr.toFixed(
            2,
          )}, below the usual threshold for many lenders.`,
    );
  }

  if (ltv > 0) {
    if (ltv <= (financingType === "private" ? 75 : 85)) {
      strengths.push(
        language === "fr"
          ? `RPV d’environ ${formatPercent(
              ltv,
            )}, dans les balises usuelles des prêteurs.`
          : `LTV of about ${formatPercent(
              ltv,
            )}, within typical lender guidelines.`,
      );
    } else if (ltv > 90) {
      risks.push(
        language === "fr"
          ? `RPV élevé d’environ ${formatPercent(
              ltv,
            )}, qui peut limiter l’appétit de plusieurs prêteurs.`
          : `High LTV of about ${formatPercent(
              ltv,
            )}, which may limit lender appetite.`,
      );
    }
  }

  if (totalReturn >= 15) {
    strengths.push(
      language === "fr"
        ? `Rendement global projeté d’environ ${formatPercent(
            totalReturn,
          )} (an 1), indiquant un profil de rendement intéressant.`
        : `Projected total one-year return of about ${formatPercent(
            totalReturn,
          )}, indicating an appealing return profile.`,
    );
  }

  const verdictConfig = {
    strong: {
      icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
      className:
        "bg-green-50 text-green-800 border-green-200 dark:border-green-300",
      label: t("dealSummary.verdict.strong"),
    },
    medium: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      className:
        "bg-amber-50 text-amber-800 border-amber-200 dark:border-amber-300",
      label: t("dealSummary.verdict.medium"),
    },
    weak: {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      className:
        "bg-red-50 text-red-800 border-red-200 dark:border-red-300",
      label: t("dealSummary.verdict.weak"),
    },
  }[verdict];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("dealSummary.title")}</h3>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${verdictConfig.className}`}
        >
          {verdictConfig.icon}
          <span>{verdictConfig.label}</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="text-gray-700 font-semibold mb-2">
            {t("dealSummary.strengths")}
          </h4>
          {strengths.length === 0 ? (
            <p className="text-gray-500">
              {language === "fr"
                ? "Aucun point fort majeur ne se démarque. Le dossier repose surtout sur vos hypothèses et votre stratégie."
                : "No major strengths clearly stand out. The file mainly relies on your assumptions and strategy."}
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="text-gray-700 font-semibold mb-2">
            {t("dealSummary.risks")}
          </h4>
          {risks.length === 0 ? (
            <p className="text-gray-500">
              {language === "fr"
                ? "Aucun risque majeur ne ressort des principaux ratios. Validez néanmoins vos hypothèses de marché."
                : "No major risk appears from the main ratios. You should still validate your market assumptions."}
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {risks.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

