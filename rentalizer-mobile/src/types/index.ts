// src/types/index.ts
export interface Property {
  id: string;
  uid: string;
  
  // Informations de base
  address: string;
  city: string;
  province: string;
  postalCode: string;
  purchasePrice: number;
  numberOfUnits: number;
  structureType?: 'woodFrame' | 'concrete';
  
  // Revenus
  annualRent: number;
  parkingRevenue?: number;
  internetRevenue?: number;
  storageRevenue?: number;
  otherRevenue?: number;
  
  // Dépenses d'exploitation
  vacancyRate?: number;
  municipalTaxes?: number;
  schoolTaxes?: number;
  insurance?: number;
  electricityHeating?: number;
  maintenance?: number;
  managementRate?: number;
  concierge?: number;
  otherExpenses?: number;
  
  // Financement
  financingType?: 'conventional' | 'cmhc' | 'cmhc_aph' | 'private';
  mortgageRate?: number;
  amortization?: number;
  downPaymentPercent?: number;
  
  // Métadonnées
  createdAt?: Date;
  updatedAt?: Date;
  advancedExpenses?: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Analysis {
  totalGrossRevenue: number;
  effectiveGrossRevenue: number;
  totalExpenses: number;
  netOperatingIncome: number;
  cashFlow: number;
  capRate: number;
  grossRentMultiplier: number;
  pricePerUnit: number;
  monthlyPayment: number;
  totalInvestment: number;
  cashOnCashReturn: number;
}

export interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}