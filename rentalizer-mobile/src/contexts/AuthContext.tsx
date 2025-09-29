import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Property } from '../types';
import * as Google from 'expo-auth-session/providers/google';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  properties: Property[];
  propertiesLoading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  const [googleRequest, , promptGoogleSignIn] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? undefined,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? undefined,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? undefined,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Délai pour s'assurer que Firebase est complètement initialisé
    const initAuth = async () => {
      try {
        // Attendre un moment pour que Firebase soit prêt
        await new Promise(resolve => setTimeout(resolve, 100));
        
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
          setCurrentUser(user);
          setLoading(false);
        }, (error) => {
          console.error('Auth state change error:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Simulation de données pour les tests
  useEffect(() => {
    if (currentUser) {
      // TODO: Remplacer par votre service getProperties réel
      const mockProperties: Property[] = [
        {
          id: '1',
          uid: currentUser.uid,
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
          uid: currentUser.uid,
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

  const signup = async (email: string, password: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
        throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
      }

      if (!googleRequest) {
        throw new Error('Google authentication request is not ready yet.');
      }

      const result = await promptGoogleSignIn();

      if (result?.type === 'success') {
        const idToken =
          result.authentication?.idToken ||
          (result.params?.id_token as string | undefined);

        if (!idToken) {
          throw new Error('Google did not return id_token');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        return;
      }

      if (result?.type === 'error') {
        const errorCode = 'error' in result ? result.error : 'unknown';
        throw new Error(`Google error: ${errorCode ?? 'unknown'}`);
      }

      throw new Error('Authentication cancelled or interrupted.');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    properties,
    propertiesLoading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}