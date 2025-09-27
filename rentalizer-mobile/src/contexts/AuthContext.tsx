import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Property } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  properties: Property[];
  propertiesLoading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Simulation de données pour les tests
  useEffect(() => {
    if (currentUser) {
      // TODO: Remplacer par votre service getProperties réel
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Rue Example',
          city: 'Montréal',
          province: 'QC',
          postalCode: 'H2B 1A0',
          purchasePrice: 450000,
          numberOfUnits: 4,
          annualRent: 36000,
        },
        {
          id: '2', 
          address: '456 Avenue Test',
          city: 'Québec',
          province: 'QC',
          postalCode: 'G1K 1A1',
          purchasePrice: 320000,
          numberOfUnits: 3,
          annualRent: 24000,
        }
      ];
      
      setProperties(mockProperties);
      setPropertiesLoading(false);
    } else {
      setProperties([]);
      setPropertiesLoading(false);
    }
  }, [currentUser]);

  const signup = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  const value: AuthContextType = {
    currentUser,
    loading,
    properties,
    propertiesLoading,
    signup,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}