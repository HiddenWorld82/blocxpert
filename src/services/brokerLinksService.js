import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const BROKER_LINKS_SUB = 'brokerLinks';

/**
 * Add a broker link for the current user (investor). Call when linking via invitation.
 * @param {string} userUid - Investor's user UID
 * @param {string} brokerUid - Broker's user UID
 * @param {string} clientId - Client document ID in the broker's clients collection
 * @param {string} [brokerDisplayName] - Broker display name for the list
 */
export async function addBrokerLink(userUid, brokerUid, clientId, brokerDisplayName = '') {
  if (!userUid || !brokerUid || !clientId) return;
  const ref = doc(firestore, 'users', userUid, BROKER_LINKS_SUB, brokerUid);
  await setDoc(ref, {
    brokerUid,
    clientId,
    brokerDisplayName: brokerDisplayName || '',
    updatedAt: new Date(),
  });
}

/**
 * Deduplicate broker links by brokerUid (old data may have used clientId as doc id, causing duplicates).
 * Keeps the canonical doc (id === brokerUid) when present, otherwise the first per brokerUid.
 */
function deduplicateBrokerLinks(links) {
  const byBroker = new Map();
  links.forEach((link) => {
    const uid = link.brokerUid;
    const existing = byBroker.get(uid);
    const isCanonical = link.id === uid;
    if (!existing || (isCanonical && existing.id !== uid)) {
      byBroker.set(uid, link);
    } else if (isCanonical && existing) {
      byBroker.set(uid, link);
    }
  });
  return Array.from(byBroker.values());
}

/**
 * Subscribe to the list of brokers linked to this user (investor).
 * Deduplicates by brokerUid so the same broker never appears twice (legacy duplicates).
 * @param {string} userUid - Investor's user UID
 * @param {(links: Array<{ brokerUid: string, clientId: string, brokerDisplayName?: string }>) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function getBrokerLinks(userUid, callback) {
  if (!userUid) return () => {};
  const colRef = collection(firestore, 'users', userUid, BROKER_LINKS_SUB);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const links = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          brokerUid: data.brokerUid || d.id,
          clientId: data.clientId || '',
          brokerDisplayName: data.brokerDisplayName || '',
        };
      });
      const deduplicated = deduplicateBrokerLinks(links);
      if (deduplicated.length < links.length) {
        removeDuplicateBrokerLinks(userUid, snapshot.docs).catch(() => {});
      }
      callback(deduplicated);
    },
    (err) => {
      console.warn('getBrokerLinks listener error:', err?.code, err?.message);
      callback([]);
    }
  );
}

/**
 * Get broker links once (for migration check without listener).
 * @param {string} userUid
 * @returns {Promise<Array<{ brokerUid: string, clientId: string, brokerDisplayName?: string }>>}
 */
export async function getBrokerLinksOnce(userUid) {
  if (!userUid) return [];
  const colRef = collection(firestore, 'users', userUid, BROKER_LINKS_SUB);
  const snapshot = await getDocs(colRef);
  const links = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      brokerUid: data.brokerUid || d.id,
      clientId: data.clientId || '',
      brokerDisplayName: data.brokerDisplayName || '',
    };
  });
  return deduplicateBrokerLinks(links);
}

/**
 * Remove duplicate broker link documents (same brokerUid, different doc ids from legacy behavior).
 * Keeps one doc per brokerUid: prefer the one whose document id equals brokerUid (canonical).
 */
export async function removeDuplicateBrokerLinks(userUid, docs) {
  if (!userUid || !docs?.length) return;
  const byBroker = new Map();
  docs.forEach((d) => {
    const data = d.data();
    const brokerUid = data.brokerUid || d.id;
    const entry = { id: d.id, ref: d.ref, brokerUid };
    const existing = byBroker.get(brokerUid);
    const isCanonical = d.id === brokerUid;
    if (!existing || (isCanonical && existing.id !== brokerUid)) {
      byBroker.set(brokerUid, entry);
    } else if (isCanonical) {
      byBroker.set(brokerUid, entry);
    }
  });
  const toDelete = docs.filter((d) => {
    const data = d.data();
    const brokerUid = data.brokerUid || d.id;
    const kept = byBroker.get(brokerUid);
    return kept && kept.id !== d.id;
  });
  await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
}

/**
 * Remove a broker link. Used by Cloud Function when broker deletes the client.
 * Can also be called by the user (investor) to unlink a broker if we add that UI.
 * @param {string} userUid - Investor's user UID
 * @param {string} brokerUid - Broker's user UID to remove
 */
export async function removeBrokerLink(userUid, brokerUid) {
  if (!userUid || !brokerUid) return;
  const ref = doc(firestore, 'users', userUid, BROKER_LINKS_SUB, brokerUid);
  await deleteDoc(ref);
}
