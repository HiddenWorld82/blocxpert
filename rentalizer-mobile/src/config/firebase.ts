import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // ⚠️ Utilisez exactement la même configuration que votre projet web
  apiKey: "AIzaSyAF1wo4_rCRgtFUJatYiGJ3tU8GGsjtQuI",
  authDomain: "blocxpert-a4f09.firebaseapp.com",
  projectId: "blocxpert-a4f09",
  storageBucket: "blocxpert-a4f09.firebasestorage.app", 
  messagingSenderId: "943428807330",
  appId: "1:943428807330:web:f92383f550620a091e85fb"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);