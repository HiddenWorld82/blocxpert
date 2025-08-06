// src/components/PropertyEditor.jsx
import React, { useState } from "react";
import defaultProperty from "../defaults/defaultProperty";

import BasicInfo from "./sections/BasicInfo";
import RevenueSection from "./sections/RevenueSection";
import FinancialSummary from "./sections/FinancialSummary";
import FinancingSection from "./sections/FinancingSection";
import AcquisitionCosts from "./sections/AcquisitionCosts";
import Recommendations from "./sections/Recommendations";
import FinancingSummary from "./sections/FinancingSummary";
import ExecutiveSummary from "./sections/ExecutiveSummary";

export default function PropertyEditor() {
  const [property, setProperty] = useState(defaultProperty);

  return (
    <div className="p-6 space-y-10">
      <BasicInfo
        property={property}
        onChange={(newData) =>
          setProperty((prev) => ({
            ...prev,
            ...newData,
          }))
        }
      />

      <RevenueSection
        revenue={property.revenue || {}}
        onChange={(revenueUpdate) =>
          setProperty((prev) => ({
            ...prev,
            revenue: {
              ...prev.revenue,
              ...revenueUpdate,
            },
          }))
        }
      />

      <FinancialSummary
        expenses={property.expenses || {}}
        onChange={(expensesUpdate) =>
          setProperty((prev) => ({
            ...prev,
            expenses: {
              ...prev.expenses,
              ...expensesUpdate,
            },
          }))
        }
      />

      <FinancingSection
        financing={property.financing || {}}
        onChange={(financingUpdate) =>
          setProperty((prev) => ({
            ...prev,
            financing: {
              ...prev.financing,
              ...financingUpdate,
            },
          }))
        }
      />

      <AcquisitionCosts
        costs={property.costs || {}}
        onChange={(costsUpdate) =>
          setProperty((prev) => ({
            ...prev,
            costs: {
              ...prev.costs,
              ...costsUpdate,
            },
          }))
        }
      />

      <FinancingSummary
        summary={{
          monthlyPayment: 1234,
          totalLoan: property.financing?.loanAmount,
          totalCosts: 5678,
          cashRequired: 23456,
        }}
      />

      <Recommendations
        recommendations={[
          "Vérifier l’assurance incendie",
          "Optimiser les revenus de stationnement",
        ]}
      />

      <ExecutiveSummary
        summary={{
          units: property.numberOfUnits,
          address: property.address,
          price: property.purchasePrice,
          loan: property.financing?.loanAmount,
          annualCashFlow: 8400,
          cashOnCashReturn: 6.2,
        }}
      />
    </div>
  );
}