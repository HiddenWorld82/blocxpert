/**
 * Index email → uid pour permettre le partage par courriel.
 * Chaque utilisateur enregistre son propre courriel à la connexion.
 */
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'userEmails';

export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Enregistre le courriel de l'utilisateur connecté (à appeler après login).
 * Permet à d'autres utilisateurs de vous envoyer un partage par courriel.
 */
export async function syncCurrentUserEmail(uid, email) {
  if (!uid || !email) return;
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  const ref = doc(firestore, COLLECTION, normalized);
  await setDoc(ref, { uid }, { merge: true });
}

/**
 * Retourne l'uid du compte associé à ce courriel, ou null si aucun.
 */
export async function getUidByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const ref = doc(firestore, COLLECTION, normalized);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().uid || null;
}
