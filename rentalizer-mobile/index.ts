export interface Property {
  id: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  purchasePrice?: number;
  numberOfUnits?: number;
  annualRent?: number;
  // Ajoutez d'autres champs selon vos besoins
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}