import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getPropertiesOnce, deleteAllPropertiesForUser } from './dataService';
import { cleanupPropertyShares, deleteAllSharesForUser } from './shareService';
import { deleteMarketParamsForUser } from './marketParamsService';

/**
 * Delete all Firestore data for the given user (properties, scenarios, shares,
 * sharedWithMe, brokerLinks, marketParams, user profile). Does not delete the
 * Firebase Auth account; caller must call auth.deleteUser() after this.
 * @param {string} uid - Firebase Auth UID
 */
export async function deleteAllUserData(uid) {
  if (!uid) return;

  // 1. For each property: clean shares (sharedWithMe entries, share docs), then delete property + scenarios
  const properties = await getPropertiesOnce(uid);
  for (const p of properties) {
    try {
      await cleanupPropertyShares(uid, p.id);
    } catch (e) {
      console.warn('deleteAllUserData: cleanupPropertyShares', p.id, e);
    }
  }
  await deleteAllPropertiesForUser(uid);

  // 2. Delete any remaining shares owned by this user (e.g. orphan share docs)
  await deleteAllSharesForUser(uid);

  // 3. Delete user subcollections (sharedWithMe, brokerLinks)
  const sharedWithMeRef = collection(firestore, 'users', uid, 'sharedWithMe');
  const sharedWithMeSnap = await getDocs(sharedWithMeRef);
  await Promise.all(sharedWithMeSnap.docs.map((d) => deleteDoc(d.ref)));

  const brokerLinksRef = collection(firestore, 'users', uid, 'brokerLinks');
  const brokerLinksSnap = await getDocs(brokerLinksRef);
  await Promise.all(brokerLinksSnap.docs.map((d) => deleteDoc(d.ref)));

  // 4. Delete market params for this user
  await deleteMarketParamsForUser(uid);

  // 5. Delete user profile document
  const userRef = doc(firestore, 'users', uid);
  await deleteDoc(userRef);
}
