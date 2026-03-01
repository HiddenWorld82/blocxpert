import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'users';

/**
 * Get user profile from Firestore. Creates doc with defaults if missing.
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<{ displayName?: string, avatarUrl?: string, persona?: string, onboardingCompleted?: boolean, defaultReportType?: string, createdAt?: object, updatedAt?: object } | null>}
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const ref = doc(firestore, COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Remove undefined values (Firestore rejects them).
 */
function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

/**
 * Create or update user profile in Firestore.
 * @param {string} uid
 * @param {object} data - { displayName?, avatarUrl?, persona?, onboardingCompleted?, defaultReportType? }
 */
export async function setUserProfile(uid, data) {
  if (!uid) throw new Error('uid required');
  const ref = doc(firestore, COLLECTION, uid);
  const snap = await getDoc(ref);
  const now = new Date();
  const payload = stripUndefined({
    ...data,
    updatedAt: now,
  });
  if (!snap.exists()) {
    await setDoc(ref, { ...payload, createdAt: now });
  } else {
    await updateDoc(ref, payload);
  }
}

/**
 * Remove broker association from a user profile (e.g. when broker deletes the client).
 * @param {string} uid - The client's user UID (clientUserId from the client doc)
 */
export async function clearBrokerLink(uid) {
  if (!uid) return;
  const ref = doc(firestore, COLLECTION, uid);
  await updateDoc(ref, {
    brokerUid: deleteField(),
    brokerClientId: deleteField(),
    updatedAt: new Date(),
  });
}

