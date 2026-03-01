import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getAphMaxLtvRatio } from "../utils/cmhc";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#374151",
  },
  coverPage: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#111827",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  headerBar: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 6,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 6,
    fontSize: 8,
    color: "#9CA3AF",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },
  subtitle: {
    fontSize: 11,
    color: "#4B5563",
    marginBottom: 16,
  },
  smallLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  smallValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#EFF6FF",
    fontSize: 9,
    color: "#1D4ED8",
    marginRight: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaColumn: {
    width: "48%",
  },
  h2: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },
  h3: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: "#6B7280",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
  },
  valuePositive: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#16A34A",
  },
  valueNegative: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#DC2626",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItemHalf: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 4,
  },
  gridItemQuarter: {
    width: "25%",
    paddingRight: 8,
    marginBottom: 4,
  },
  bulletList: {
    marginTop: 4,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 9,
    marginRight: 4,
  },
  bulletText: {
    fontSize: 9,
    color: "#374151",
    flex: 1,
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
    color: "#374151",
  },
  smallParagraph: {
    fontSize: 8,
    marginBottom: 3,
    lineHeight: 1.3,
    color: "#6B7280",
  },
  bold: {
    fontWeight: "bold",
  },
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatPercent = (value, digits = 1) =>
  `${new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0)}%`;

function computeSchlCompliance(analysis, property) {
  const operatingSchl = analysis?.operatingExpensesSCHL || 0;
  const operatingTotal = analysis?.operatingExpensesTotal || 0;
  const loanValueRatio = analysis?.loanValueRatio || 0;

  const hasSchl = operatingSchl > 0 && operatingTotal > 0;
  const ratio = hasSchl ? operatingTotal / operatingSchl : null;
  const diffPct = ratio != null ? (ratio - 1) * 100 : null;

  let expensesStatus = null;
  if (diffPct != null) {
    if (diffPct < -10) expensesStatus = "below";
    else if (diffPct > 10) expensesStatus = "above";
    else expensesStatus = "within";
  }

  const financingType = property?.financingType;
  const points = parseInt(property?.aphPoints || 0, 10) || 0;

  let ltvMax = null;
  let ltvLabel = null;
  if (financingType === "cmhc_aph") {
    ltvMax = getAphMaxLtvRatio(points) * 100;
    ltvLabel = "RPV max APH (approx.)";
  } else if (financingType === "cmhc") {
    ltvMax = 85;
    ltvLabel = "RPV max SCHL (approx.)";
  }

  let ltvStatus = null;
  if (ltvMax != null) {
    ltvStatus = loanValueRatio <= ltvMax ? "ok" : "tooHigh";
  }

  return {
    hasSchl,
    ratio,
    diffPct,
    expensesStatus,
    loanValueRatio,
    ltvMax,
    ltvLabel,
    ltvStatus,
    points,
  };
}

export function RentalizerPdfDocument({
  title = "Rapport d'analyse Rentalyzer",
  property,
  analysis,
  futureReturns,
  reportType = "client", // "client" | "bank" | "advanced"
  marketParamsVersion = null, // { label, createdAt } for courtier versioning
}) {
  const fullAddress = [
    property?.address,
    property?.city,
    property?.province,
    property?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const isCashflowPositive = (analysis?.cashFlow || 0) >= 0;
  const avgRentPerDoor =
    ((parseFloat(property?.annualRent) || 0) /
      (parseInt(property?.numberOfUnits, 10) || 1)) /
    12;

  const schl = computeSchlCompliance(analysis, property || {});

  const today = new Date();
  const formattedDate = today.toLocaleDateString("fr-CA");

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.brand}>Rentalyzer – Rapport d'analyse</Text>
          <View style={{ marginTop: 24, marginBottom: 16 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {fullAddress || "Propriété à analyser"} ·{" "}
              {property?.numberOfUnits || 0} unités
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.smallLabel}>Client</Text>
              <Text style={styles.smallValue}>
                {property?.clientName || "—"}
              </Text>
              <Text style={[styles.smallLabel, { marginTop: 6 }]}>
                Courtier / Analyste
              </Text>
              <Text style={styles.smallValue}>
                {property?.analystName || "—"}
              </Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.smallLabel}>Date</Text>
              <Text style={styles.smallValue}>{formattedDate}</Text>
              <Text style={[styles.smallLabel, { marginTop: 6 }]}>
                Type de rapport
              </Text>
              <Text style={styles.smallValue}>
                {reportType === "bank"
                  ? "Banque / Underwriting"
                  : reportType === "advanced"
                  ? "Investisseur avancé"
                  : "Client final"}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14, marginBottom: 6 }}>
            <Text style={styles.h3}>Résumé en un coup d’œil</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Investissement d&apos;environ{" "}
                <Text style={styles.bold}>
                  {formatCurrency(Number(property?.purchasePrice) || 0)}
                </Text>{" "}
                pour{" "}
                <Text style={styles.bold}>
                  {property?.numberOfUnits || 0} logements
                </Text>{" "}
                ({formatCurrency(Math.round(analysis?.pricePerUnit || 0))} /
                porte).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Revenu net d&apos;exploitation (NOI) estimé à{" "}
                <Text style={styles.bold}>
                  {formatCurrency(analysis?.netOperatingIncome)}
                </Text>{" "}
                pour un TGA d&apos;environ{" "}
                <Text style={styles.bold}>
                  {formatPercent(analysis?.capRate)}
                </Text>
                .
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Cashflow annuel{" "}
                <Text
                  style={
                    isCashflowPositive
                      ? styles.valuePositive
                      : styles.valueNegative
                  }
                >
                  {formatCurrency(analysis?.cashFlow)}
                </Text>{" "}
                après service de la dette, soit un rendement cash-on-cash
                d&apos;environ{" "}
                <Text style={styles.bold}>
                  {formatPercent(analysis?.cashOnCashReturn)}
                </Text>
                .
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                RPV d&apos;environ{" "}
                <Text style={styles.bold}>
                  {formatPercent(analysis?.loanValueRatio)}
                </Text>
                {schl.ltvMax != null && (
                  <Text>
                    {" "}
                    (max typique ~{formatPercent(schl.ltvMax)} pour ce type de
                    financement).
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.smallParagraph}>
            Ce rapport Rentalyzer est fourni à titre informatif uniquement et ne
            constitue pas un conseil financier, fiscal, légal ou de
            sollicitation. Les résultats reposent sur les données et hypothèses
            fournies; il revient au lecteur de valider ces informations auprès
            de ses propres conseillers professionnels.
          </Text>
        </View>
      </Page>

      {/* Page 2 – Résumé exécutif & propriété */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brand}>Rentalyzer</Text>
          <Text style={{ fontSize: 9, color: "#6B7280" }}>
            Résumé exécutif
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Résumé exécutif</Text>
          <Text style={styles.paragraph}>
            Vous analysez un immeuble de{" "}
            <Text style={styles.bold}>
              {property?.numberOfUnits || 0} logements
            </Text>{" "}
            situé au{" "}
            <Text style={styles.bold}>
              {fullAddress || "adresse non spécifiée"}
            </Text>
            , pour un prix d&apos;achat estimé à{" "}
            <Text style={styles.bold}>
              {formatCurrency(Number(property?.purchasePrice) || 0)}
            </Text>
            . L&apos;investissement total (mise de fonds + frais) est de
            l&apos;ordre de{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.totalInvestment)}
            </Text>
            .
          </Text>
          <Text style={styles.paragraph}>
            Le revenu net d&apos;exploitation (NOI) annuel est estimé à{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.netOperatingIncome)}
            </Text>{" "}
            pour un taux de capitalisation d&apos;environ{" "}
            <Text style={styles.bold}>
              {formatPercent(analysis?.capRate)}
            </Text>
            . Le cashflow annuel projeté après service de la dette est de{" "}
            <Text
              style={
                isCashflowPositive ? styles.valuePositive : styles.valueNegative
              }
            >
              {formatCurrency(analysis?.cashFlow)}
            </Text>
            , ce qui correspond à un rendement cash-on-cash d&apos;environ{" "}
            <Text style={styles.bold}>
              {formatPercent(analysis?.cashOnCashReturn)}
            </Text>
            .
          </Text>
          <Text style={styles.paragraph}>
            Le financement envisagé est de type{" "}
            <Text style={styles.bold}>
              {property?.financingType === "conventional" && "conventionnel"}
              {property?.financingType === "cmhc" && "SCHL standard"}
              {property?.financingType === "cmhc_aph" && "SCHL APH Select"}
              {property?.financingType === "private" && "prêt privé"}
            </Text>
            , pour un montant d&apos;environ{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.maxLoanAmount)}
            </Text>
            , soit un ratio prêt-valeur (RPV) d&apos;environ{" "}
            <Text style={styles.bold}>
              {formatPercent(analysis?.loanValueRatio)}
            </Text>
            . Le paiement hypothécaire mensuel estimé est de{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.monthlyPayment)}
            </Text>
            .
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Profil de la propriété</Text>
          <View style={styles.grid}>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Prix d&apos;achat</Text>
                <Text style={styles.value}>
                  {formatCurrency(Number(property?.purchasePrice) || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Prix par porte</Text>
                <Text style={styles.value}>
                  {formatCurrency(Math.round(analysis?.pricePerUnit || 0))}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Loyer moyen par porte</Text>
                <Text style={styles.value}>
                  {formatCurrency(Math.round(avgRentPerDoor || 0))} / mois
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Revenus bruts</Text>
                <Text style={styles.value}>
                  {formatCurrency(analysis?.totalGrossRevenue)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Rentalyzer – Rapport d&apos;analyse de rentabilité</Text>
          <Text>Page 2</Text>
        </View>
      </Page>

      {/* Page 3 – Financement, cashflow, SCHL & hypothèses */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brand}>Rentalyzer</Text>
          <Text style={{ fontSize: 9, color: "#6B7280" }}>
            Détails financiers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Détail du financement</Text>
          <View style={styles.grid}>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Type de financement</Text>
                <Text style={styles.value}>
                  {property?.financingType === "conventional" && "Conventionnel"}
                  {property?.financingType === "cmhc" && "SCHL standard"}
                  {property?.financingType === "cmhc_aph" &&
                    "SCHL APH Select"}
                  {property?.financingType === "private" && "Prêt privé"}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Montant du prêt</Text>
                <Text style={styles.value}>
                  {formatCurrency(analysis?.maxLoanAmount)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>RPV (ratio prêt-valeur)</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.loanValueRatio)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Mise de fonds</Text>
                <Text style={styles.value}>
                  {formatCurrency(analysis?.downPayment)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Taux hypothécaire</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.mortgageRate)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Amortissement (années)</Text>
                <Text style={styles.value}>
                  {property?.amortization || "—"}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>RCD (ratio couverture dette)</Text>
                <Text style={styles.value}>
                  {(analysis?.actualDebtCoverageRatio || 0).toFixed(2)}
                </Text>
              </View>
            </View>
            {property?.financingType === "cmhc_aph" && (
              <View style={styles.gridItemHalf}>
                <View style={styles.card}>
                  <Text style={styles.label}>Points APH</Text>
                  <Text style={styles.value}>
                    {property?.aphPoints || 0}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Cashflow & rentabilité (an 1)</Text>
          <View style={styles.grid}>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>TGA (taux de capitalisation)</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.capRate)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Rendement cash-on-cash</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.cashOnCashReturn)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>
                  Rendement remboursement de capital
                </Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.loanPaydownReturn)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Rendement sur appréciation</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.appreciationReturn)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Rendement global (an 1)</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.totalReturn)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Cashflow annuel</Text>
                <Text
                  style={
                    isCashflowPositive
                      ? styles.valuePositive
                      : styles.valueNegative
                  }
                >
                  {formatCurrency(analysis?.cashFlow)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {futureReturns && reportType !== "bank" && (
          <View style={styles.section}>
            <Text style={styles.h2}>
              Rendements projetés sur {futureReturns.years} an(s)
            </Text>
            <View style={styles.grid}>
              <View style={styles.gridItemHalf}>
                <View style={styles.card}>
                  <Text style={styles.label}>Rendement global</Text>
                  <Text style={styles.value}>
                    {formatPercent(futureReturns.totalReturn, 2)}
                  </Text>
                </View>
              </View>
              <View style={styles.gridItemHalf}>
                <View style={styles.card}>
                  <Text style={styles.label}>Rendement annualisé</Text>
                  <Text style={styles.value}>
                    {formatPercent(futureReturns.annualizedReturn, 2)}
                  </Text>
                </View>
              </View>
              <View style={styles.gridItemHalf}>
                <View style={styles.card}>
                  <Text style={styles.label}>
                    TRI à la {futureReturns.years}e année
                  </Text>
                  <Text style={styles.value}>
                    {formatPercent(futureReturns.irr, 2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.h2}>Conformité SCHL & benchmarks</Text>
          {schl.hasSchl ? (
            <View style={styles.card}>
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>
                  Dépenses d&apos;exploitation vs barème SCHL
                </Text>
                <Text style={styles.value}>
                  {formatCurrency(analysis?.operatingExpensesTotal)}{" "}
                  <Text style={{ fontSize: 9, color: "#6B7280" }}>
                    (référence SCHL ~
                    {formatCurrency(analysis?.operatingExpensesSCHL || 0)})
                  </Text>
                </Text>
                {schl.diffPct != null && (
                  <Text style={styles.smallParagraph}>
                    Écart d&apos;environ {formatPercent(schl.diffPct, 1)} par
                    rapport au barème.{" "}
                    {schl.expensesStatus === "within" && (
                      <Text style={styles.bold}>
                        Globalement aligné avec les barèmes SCHL usuels.
                      </Text>
                    )}
                    {schl.expensesStatus === "below" && (
                      <Text style={styles.bold}>
                        Niveau de dépenses sous les barèmes – les
                        souscripteurs pourraient remettre en question certaines
                        hypothèses si elles semblent trop optimistes.
                      </Text>
                    )}
                    {schl.expensesStatus === "above" && (
                      <Text style={styles.bold}>
                        Niveau de dépenses au-dessus des barèmes – scénario
                        prudent, mais NOI et capacité d&apos;emprunt réduits.
                      </Text>
                    )}
                  </Text>
                )}
              </View>
              {schl.ltvMax != null && (
                <View>
                  <Text style={styles.label}>{schl.ltvLabel}</Text>
                  <Text style={styles.value}>
                    {formatPercent(schl.loanValueRatio)}{" "}
                    <Text style={{ fontSize: 9, color: "#6B7280" }}>
                      (max typique ~{formatPercent(schl.ltvMax)})
                    </Text>
                  </Text>
                  <Text style={styles.smallParagraph}>
                    {schl.ltvStatus === "ok" ? (
                      <Text style={styles.bold}>
                        Le RPV demeure dans les balises usuelles associées à ce
                        programme de financement.
                      </Text>
                    ) : (
                      <Text style={styles.bold}>
                        Le RPV excède le maximum typique – un ajustement de la
                        mise de fonds, de la valeur ou de la structure pourrait
                        être nécessaire.
                      </Text>
                    )}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.smallParagraph}>
              Les données disponibles ne permettent pas de comparer
              précisément les dépenses d&apos;exploitation aux barèmes SCHL
              dans ce scénario.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Hypothèses & méthodologie</Text>
          {marketParamsVersion?.label && (
            <Text style={styles.smallParagraph}>
              Hypothèses marché {marketParamsVersion.label} – mises à jour le{" "}
              {marketParamsVersion.createdAt
                ? new Date(marketParamsVersion.createdAt).toLocaleDateString("fr-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
              .
            </Text>
          )}
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Revenus, dépenses et conditions de financement basés sur les
                données saisies par l&apos;utilisateur dans Rentalyzer.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Dépenses d&apos;exploitation normalisées selon les barèmes
                SCHL par province, type de structure (bois / béton) et taille
                de l&apos;immeuble lorsque ces données sont disponibles.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Calcul du TGA basé sur le revenu net d&apos;exploitation
                (NOI) et le prix payé; rendement cash-on-cash calculé sur la
                mise de fonds et les frais.
              </Text>
            </View>
            {futureReturns && (
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Rendements futurs projetés sur{" "}
                  {futureReturns.years} ans à partir des hypothèses de
                  croissance des revenus, des dépenses et de la valeur
                  marchande définies dans l&apos;analyse.
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.smallParagraph}>
            Les barèmes SCHL et paramètres de marché utilisés peuvent être
            mis à jour périodiquement. Il est recommandé de vérifier la date de
            mise à jour de vos hypothèses et de vos barèmes avant de vous baser
            sur ce rapport pour une décision d&apos;investissement ou de
            financement.
          </Text>
          <Text style={styles.smallParagraph}>
            Ce rapport généré avec Rentalyzer ne remplace pas une évaluation
            agréée, un avis de souscripteur ou un conseil indépendant. L&apos;usage
            de ce document demeure sous la responsabilité du lecteur.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Rentalyzer – Rapport d&apos;analyse de rentabilité</Text>
          <Text>Page 3</Text>
        </View>
      </Page>
    </Document>
  );
}
