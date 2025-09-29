import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

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

  const googleLoginPromiseRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const [googleRequest, googleResponse, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

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

  useEffect(() => {
    if (!googleResponse || !googleLoginPromiseRef.current) {
      return;
    }

    (async () => {
      const pendingPromise = googleLoginPromiseRef.current;

      try {
        if (googleResponse.type === 'success') {
          const params = googleResponse.params as Record<string, string> | undefined;
          const idToken = googleResponse.authentication?.idToken || params?.id_token;
          const accessToken = googleResponse.authentication?.accessToken || params?.access_token;

          if (!idToken) {
            throw new Error('Google authentication did not return an ID token.');
          }

          const credential = GoogleAuthProvider.credential(idToken, accessToken);
          await signInWithCredential(auth, credential);
          pendingPromise?.resolve();
          return;
        }

        if (googleResponse.type === 'error') {
          const errorResult = googleResponse as AuthSession.ErrorResult;
          throw new Error(errorResult.errorCode || errorResult.error || 'Google authentication failed');
        }

        if (googleResponse.type === 'dismiss' || googleResponse.type === 'cancel') {
          throw new Error('Google authentication was cancelled.');
        }

        if (googleResponse.type === 'locked') {
          throw new Error('Authentication is already in progress.');
        }
      } catch (error) {
        const authError = error instanceof Error ? error : new Error(String(error));
        pendingPromise?.reject(authError);
      } finally {
        googleLoginPromiseRef.current = null;
      }
    })();
  }, [googleResponse]);

  const loginWithGoogle = async () => {
    try {
      if (!googleRequest) {
        throw new Error('Google authentication is not ready.');
      }

      await new Promise<void>((resolve, reject) => {
        googleLoginPromiseRef.current = { resolve, reject };

        promptAsync().catch((error) => {
          googleLoginPromiseRef.current = null;
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });
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