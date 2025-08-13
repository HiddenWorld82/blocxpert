import React from 'react';

const AmortizationPage = ({ analysis, currentProperty, setCurrentStep }) => {
  const loanAmount = analysis.totalLoanAmount || 0;
  const monthlyPayment = analysis.monthlyPayment || 0;
  const mortgageRate = parseFloat(currentProperty.mortgageRate) || 0;
  const amortYears = parseInt(currentProperty.amortization) || 0;
  const totalMonths = amortYears * 12;
  const monthlyRate = Math.pow(1 + mortgageRate / 100 / 2, 1 / 6) - 1;
  let balance = loanAmount;
  let cumulativePrincipal = 0;
  const monthlyAppreciation = 0.03 / 12;
  const purchasePrice = parseFloat(currentProperty.purchasePrice) || 0;
  const rows = [];
  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, balance);
    balance -= principal;
    cumulativePrincipal += principal;
    const propertyValue = purchasePrice * (1 + monthlyAppreciation * month);
    const equity = propertyValue - balance - analysis.acquisitionCosts;
    rows.push({
      month,
      balance,
      interest,
      principal,
      cumulativePrincipal,
      propertyValue,
      equity,
    });
  }
  const formatMoney = (value) =>
    new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  if (rows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Tableau d'Amortissement</h2>
            <button
              onClick={() => setCurrentStep('report')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Retour
            </button>
          </div>
          <p className="text-center text-gray-600">Données d'amortissement indisponibles.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Tableau d'Amortissement</h2>
          <button
            onClick={() => setCurrentStep('report')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-center">Période (mois)</th>
                <th className="px-2 py-1 text-center">Solde du prêt</th>
                <th className="px-2 py-1 text-center">Versement intérêt</th>
                <th className="px-2 py-1 text-center">Versement capital</th>
                <th className="px-2 py-1 text-center">Capital cumulé</th>
                <th className="px-2 py-1 text-center">Valeur immeuble</th>
                <th className="px-2 py-1 text-center">Équité</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className={r.month % 12 === 0 ? "border-t bg-gray-200" : "border-t"}>
                  <td className="px-2 py-1 text-center">{r.month}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.balance)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.interest)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.principal)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.cumulativePrincipal)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.propertyValue)}</td>
                  <td className="px-2 py-1 text-center">{formatMoney(r.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AmortizationPage;
