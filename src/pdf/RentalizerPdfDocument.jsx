import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#374151",
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
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  h2: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
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
  paragraph: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
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

export function RentalizerPdfDocument({
  title = "Rapport d'analyse Rentalyzer",
  property,
  analysis,
  futureReturns,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, styles.header]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {fullAddress || "Propriété à analyser"} ·{" "}
            {property?.numberOfUnits || 0} unités
          </Text>
        </View>

        <View style={[styles.section, styles.card]}>
          <Text style={styles.h2}>Résumé de la propriété</Text>
          <View style={styles.grid}>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Prix demandé</Text>
              <Text style={styles.value}>
                {formatCurrency(Number(property?.askingPrice) || 0)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Prix d&apos;achat</Text>
              <Text style={styles.value}>
                {formatCurrency(Number(property?.purchasePrice) || 0)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Nb d&apos;unités</Text>
              <Text style={styles.value}>
                {property?.numberOfUnits || "N/A"}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Prix par porte</Text>
              <Text style={styles.value}>
                {formatCurrency(Math.round(analysis?.pricePerUnit || 0))}
              </Text>
            </View>

            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Revenus bruts</Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.totalGrossRevenue)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Dépenses totales</Text>
              <Text style={styles.valueNegative}>
                {formatCurrency(analysis?.totalExpenses)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Service de la dette (an 1)</Text>
              <Text style={styles.valueNegative}>
                {formatCurrency(analysis?.annualDebtService)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Cashflow annuel</Text>
              <Text
                style={
                  isCashflowPositive ? styles.valuePositive : styles.valueNegative
                }
              >
                {formatCurrency(analysis?.cashFlow)}
              </Text>
            </View>

            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Type de financement</Text>
              <Text style={styles.value}>
                {property?.financingType === "conventional" && "Conventionnel"}
                {property?.financingType === "cmhc" && "SCHL"}
                {property?.financingType === "cmhc_aph" && "SCHL APH Select"}
                {property?.financingType === "private" && "Privé"}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Montant du prêt</Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.maxLoanAmount)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Mise de fonds</Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.downPayment)}
              </Text>
            </View>
            <View style={styles.gridItemQuarter}>
              <Text style={styles.label}>Investissement total</Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.totalInvestment)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Indicateurs clés</Text>
          <View style={styles.grid}>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Taux de capitalisation (TGA)</Text>
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
                <Text style={styles.label}>Valeur créée année 1</Text>
                <Text
                  style={
                    (analysis?.valueGeneratedYear1 || 0) >= 0
                      ? styles.valuePositive
                      : styles.valueNegative
                  }
                >
                  {formatCurrency(analysis?.valueGeneratedYear1)}
                </Text>
              </View>
            </View>
            <View style={styles.gridItemHalf}>
              <View style={styles.card}>
                <Text style={styles.label}>Rendement global</Text>
                <Text style={styles.value}>
                  {formatPercent(analysis?.totalReturn)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.card]}>
          <Text style={styles.h2}>Synthèse financière annuelle</Text>
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Revenus bruts</Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.totalGrossRevenue)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Revenus effectifs</Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.effectiveGrossRevenue)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Dépenses d&apos;exploitation</Text>
              <Text style={styles.valueNegative}>
                {formatCurrency(analysis?.operatingExpensesTotal)}
              </Text>
            </View>
            <View style={[styles.row, { marginTop: 4 }]}>
              <Text style={[styles.label, styles.bold]}>
                Revenu net d&apos;exploitation
              </Text>
              <Text style={styles.value}>
                {formatCurrency(analysis?.effectiveNetIncome)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Service de la dette</Text>
              <Text style={styles.valueNegative}>
                {formatCurrency(analysis?.annualDebtService)}
              </Text>
            </View>
            <View style={[styles.row, { marginTop: 4 }]}>
              <Text style={[styles.label, styles.bold]}>Cashflow annuel</Text>
              <Text
                style={
                  isCashflowPositive ? styles.valuePositive : styles.valueNegative
                }
              >
                {formatCurrency(analysis?.cashFlow)}
              </Text>
            </View>
          </View>
        </View>

        {futureReturns && (
          <View style={[styles.section, styles.card]}>
            <Text style={styles.h2}>
              Rendements projetés sur {futureReturns.years} an(s)
            </Text>
            <View style={styles.grid}>
              <View style={styles.gridItemHalf}>
                <Text style={styles.label}>Rendement global</Text>
                <Text style={styles.value}>
                  {formatPercent(futureReturns.totalReturn, 2)}
                </Text>
              </View>
              <View style={styles.gridItemHalf}>
                <Text style={styles.label}>Rendement annualisé</Text>
                <Text style={styles.value}>
                  {formatPercent(futureReturns.annualizedReturn, 2)}
                </Text>
              </View>
              <View style={styles.gridItemHalf}>
                <Text style={styles.label}>
                  TRI à la {futureReturns.years}e année
                </Text>
                <Text style={styles.value}>
                  {formatPercent(futureReturns.irr, 2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.section, styles.card]}>
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
            , pour un prix d&apos;achat d&apos;environ{" "}
            <Text style={styles.bold}>
              {formatCurrency(Number(property?.purchasePrice) || 0)}
            </Text>
            .
          </Text>
          <Text style={styles.paragraph}>
            Le revenu net d&apos;exploitation annuel est estimé à{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.netOperatingIncome)}
            </Text>{" "}
            pour un taux de capitalisation de{" "}
            <Text style={styles.bold}>{formatPercent(analysis?.capRate)}</Text>.
            Le cashflow annuel après service de la dette est de{" "}
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
            L&apos;investissement total requis est de l&apos;ordre de{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.totalInvestment)}
            </Text>
            , pour un paiement hypothécaire mensuel d&apos;environ{" "}
            <Text style={styles.bold}>
              {formatCurrency(analysis?.monthlyPayment)}
            </Text>
            .
          </Text>
        </View>
      </Page>
    </Document>
  );
}

