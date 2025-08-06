// defaults/defaultProperty.js

const defaultProperty = {
  address: '',
  numberOfUnits: '',
  purchasePrice: '',
  askingPrice: '',
  municipalEvaluation: '',

  revenue: {
    annualRent: '',
    parkingRevenue: '',
    internetRevenue: '',
    storageRevenue: '',
    otherRevenue: '',
  },

  expenses: {
    vacancyRate: '3',
    municipalTaxes: '',
    schoolTaxes: '',
    heating: '',
    electricity: '',
    insurance: '',
    maintenance: '610',
    managementRate: '5',
    concierge: '365',
    landscaping: '',
    snowRemoval: '',
    extermination: '',
    fireInspection: '',
    advertising: '',
    legal: '',
    accounting: '',
    elevator: '',
    cableInternet: '',
    appliances: '',
    garbage: '',
    washerDryer: '',
    hotWater: '',
    otherExpenses: '',
  },

  financing: {
    financingType: 'conventional',
    aphPoints: '',
    debtCoverageRatio: '1.15',
    qualificationRate: '6.0',
    mortgageRate: '5.5',
    amortization: '25',
    term: '5',
    loanAmount: '',
    interestRate: '',
  },

  costs: {
    inspection: '',
    environmental1: '',
    environmental2: '',
    environmental3: '',
    otherTests: '',
    appraiser: '',
    renovations: '',
    cmhcAnalysis: '150',
    cmhcTax: '',
    welcomeTax: '',
  },

  projections: {
    appreciationRate: 2.5,
    rentIncreaseRate: 2.0,
    expenseIncreaseRate: 2.5,
  },
};

export default defaultProperty;
