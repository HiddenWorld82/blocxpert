import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  setPersistence,
  type Persistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

type ReactNativePersistenceFn = (storage: typeof AsyncStorage) => Persistence;
let getReactNativePersistenceFn: ReactNativePersistenceFn | undefined;

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const rnAuthModule = require('firebase/node_modules/@firebase/auth/dist/rn');

    if (typeof rnAuthModule?.getReactNativePersistence === 'function') {
      getReactNativePersistenceFn = rnAuthModule.getReactNativePersistence as ReactNativePersistenceFn;
    }
  } catch (nativePersistenceError) {
    console.warn(
      'React Native persistence helper unavailable, falling back to default persistence.',
      nativePersistenceError,
    );
  }
}

try {
  // Initialiser Firebase seulement s'il n'est pas déjà initialisé
  const apps = getApps();
  
  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  if (Platform.OS === 'web') {
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((persistenceError) => {
      console.warn('Failed to set web auth persistence:', persistenceError);
    });
  } else if (getReactNativePersistenceFn) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistenceFn(AsyncStorage),
    });
  } else {
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
