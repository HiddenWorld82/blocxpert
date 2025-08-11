// defaults/defaultProperty.js

const defaultProperty = {
  type: 'achat initial',
  year: new Date().getFullYear(),
  address: '',
  askingPrice: '',
  purchasePrice: '',
  municipalEvaluation: '',
  numberOfUnits: '',

  // Revenus
  annualRent: '',
  parkingRevenue: '',
  internetRevenue: '',
  storageRevenue: '',
  otherRevenue: '',

  // Dépenses simplifiées
  municipalTaxes: '',
  schoolTaxes: '',
  insurance: '',
  electricityHeating: '',
  maintenance: '610',
  concierge: '365',
  managementRate: '5',
  operatingExpenses: '',
  otherExpenses: '',


  // Dépenses avancées
  vacancyRate: '3',
  heating: '',
  electricity: '',
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

  // Financement
  financingType: 'conventional',
  aphPoints: '',
  debtCoverageRatio: '1.15',
  qualificationRate: '6.0',
  mortgageRate: '5.5',
  amortization: '25',
  term: '5',

  // Frais d'acquisition
  inspection: '',
  environmental1: '',
  environmental2: '',
  environmental3: '',
  otherTests: '',
  appraiser: '',
  expertises: '',
  notary: '',
  renovations: '',
  cmhcAnalysis: '150',
  cmhcTax: '',
  welcomeTax: '',

  renovationImpact: '',

  // Paramètres futurs
  appreciationRate: 2.5,
  rentIncreaseRate: 2.0,
  expenseIncreaseRate: 2.5
};

export default defaultProperty;
