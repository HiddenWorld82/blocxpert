import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
} as const;

// Vérification des variables d'environnement
const missingConfigKey = Object.entries(firebaseConfig).find(([, value]) => !value);

if (missingConfigKey) {
  const [key] = missingConfigKey;
  console.warn(`Firebase configuration value for "${key}" is missing. Using default Firebase for development.`);
  
  // Configuration par défaut pour le développement (optionnel)
  // Vous pouvez commenter ces lignes si vous voulez forcer l'erreur
  const defaultConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456789",
  };
  
  Object.assign(firebaseConfig, defaultConfig);
}

let app: FirebaseApp;
let auth: any;
let firestore: any;

try {
  // Initialiser Firebase seulement s'il n'est pas déjà initialisé
  const apps = getApps();
  
  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
    
    // Initialiser Auth avec persistance pour React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    app = getApp();
    auth = getAuth(app);
  }
  
  // Initialiser Firestore
  firestore = getFirestore(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // En cas d'erreur, créer des objets mock pour éviter les crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.reject(new Error('Firebase not configured')),
    sendPasswordResetEmail: () => Promise.reject(new Error('Firebase not configured')),
  };
  
  firestore = {
    collection: () => ({}),
    doc: () => ({}),
  };
}

export { app, auth, firestore };