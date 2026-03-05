import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'brokerDisplayNames';

/**
 * Publish broker display name so clients can show it when picking a broker (e.g. in BrokerPickerModal).
 * Call when a broker loads the app so their name is available for existing links that don't have it stored.
 * @param {string} brokerUid - Broker's user UID
 * @param {string} displayName - Display name to show (e.g. from user profile or Firebase Auth)
 */
export async function setBrokerDisplayName(brokerUid, displayName) {
  if (!brokerUid) return;
  const ref = doc(firestore, COLLECTION, brokerUid);
  await setDoc(ref, { displayName: displayName || '', updatedAt: new Date() }, { merge: true });
}

/**
 * Get broker display name (for client UI when broker link has no brokerDisplayName).
 * @param {string} brokerUid
 * @returns {Promise<string>}
 */
export async function getBrokerDisplayName(brokerUid) {
  if (!brokerUid) return '';
  const ref = doc(firestore, COLLECTION, brokerUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return '';
  const name = snap.data()?.displayName;
  return typeof name === 'string' ? name.trim() : '';
}
