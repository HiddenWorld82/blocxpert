// src/components/sections/Recommendations.jsx
import React from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Recommendations({ analysis }) {
  const { t } = useLanguage();
  const recommendations = [];

  // Analyse du Cap Rate
  if (analysis?.capRate < 4) {
    recommendations.push({
      type: "danger",
      icon: <XCircle className="w-5 h-5" />,
      text: t('recommendations.capRate.veryLow')
    });
  } else if (analysis?.capRate < 5) {
    recommendations.push({
      type: "warning",
      icon: <AlertCircle className="w-5 h-5" />,
      text: t('recommendations.capRate.low')
    });
  } else {
    recommendations.push({
      type: "success",
      icon: <CheckCircle className="w-5 h-5" />,
      text: t('recommendations.capRate.good')
    });
  }

  // Analyse du Cash Flow
  if (analysis?.cashFlow < 0) {
    recommendations.push({
      type: "danger",
      icon: <XCircle className="w-5 h-5" />,
      text: t('recommendations.cashFlow.negative')
    });
  } else if (analysis?.cashFlow / analysis?.effectiveNetIncome < 0.02) {
    recommendations.push({
      type: "warning",
      icon: <AlertCircle className="w-5 h-5" />,
      text: t('recommendations.cashFlow.low')
    });
  } else {
    recommendations.push({
      type: "success",
      icon: <CheckCircle className="w-5 h-5" />,
      text: t('recommendations.cashFlow.good')
    });
  }

  const getColorClass = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">{t('recommendations.title')}</h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg border ${getColorClass(rec.type)}`}
          >
            <div className="mt-0.5">{rec.icon}</div>
            <p className="flex-1 text-sm font-medium">{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}