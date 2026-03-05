import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { firestore, storage } from '../config/firebase';

const COLLECTION = 'financementDossiers';
const DOSSIER_FILES_PREFIX = 'dossier-files';

/**
 * Create a financing dossier (broker requests dossier from client).
 * @param {{ propertyId: string, ownerUid: string, brokerUid: string, brokerDisplayName?: string, checklistId: string, checklistSnapshot: object }} data
 * @returns {Promise<string>} dossier id
 */
export async function createFinancementDossier(data) {
  const { propertyId, ownerUid, brokerUid, brokerDisplayName, checklistId, checklistSnapshot } = data;
  if (!propertyId || !ownerUid || !brokerUid || !checklistSnapshot?.items) {
    throw new Error('propertyId, ownerUid, brokerUid and checklistSnapshot.items required');
  }
  const ref = await addDoc(collection(firestore, COLLECTION), {
    propertyId,
    ownerUid,
    brokerUid,
    brokerDisplayName: brokerDisplayName || null,
    checklistId: checklistId || null,
    checklistSnapshot: { items: checklistSnapshot.items },
    status: 'not_started',
    responses: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * @param {string} dossierId
 * @returns {Promise<object | null>}
 */
export async function getFinancementDossier(dossierId) {
  if (!dossierId) return null;
  const ref = doc(firestore, COLLECTION, dossierId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Dossiers for a property (for owner: list by propertyId; for broker: filter by brokerUid).
 * @param {string} propertyId
 * @param {string} [ownerUid] - if provided, filter by ownerUid
 * @returns {Promise<Array<object>>}
 */
export async function getFinancementDossiersByProperty(propertyId, ownerUid) {
  if (!propertyId) return [];
  const q = query(
    collection(firestore, COLLECTION),
    where('propertyId', '==', propertyId),
    ...(ownerUid ? [where('ownerUid', '==', ownerUid)] : [])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete all financing dossiers for a property (owner deleting property). Used for full cleanup.
 * @param {string} propertyId
 * @param {string} ownerUid
 */
export async function deleteFinancementDossiersByProperty(propertyId, ownerUid) {
  if (!propertyId || !ownerUid) return;
  const dossiers = await getFinancementDossiersByProperty(propertyId, ownerUid);
  await Promise.all(dossiers.map((d) => deleteDoc(doc(firestore, COLLECTION, d.id))));
}

/**
 * Dossiers where the current user is the broker (for "Mes dossiers reçus").
 * @param {string} brokerUid
 * @param {(list: Array<object>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeFinancementDossiersByBroker(brokerUid, callback) {
  if (!brokerUid) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(firestore, COLLECTION),
    where('brokerUid', '==', brokerUid)
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('subscribeFinancementDossiersByBroker error', err);
      callback([]);
    }
  );
}

/**
 * Subscribe to dossiers for one property and one broker (for broker viewing client property).
 * @param {string} propertyId
 * @param {string} brokerUid
 * @param {(list: Array<object>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeFinancementDossiersByPropertyAndBroker(propertyId, brokerUid, callback) {
  if (!propertyId || !brokerUid) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(firestore, COLLECTION),
    where('propertyId', '==', propertyId),
    where('brokerUid', '==', brokerUid)
  );
  return onSnapshot(
    q,
    (snapshot) =>
      callback(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(isActiveDossier)
      ),
    (err) => {
      console.warn('subscribeFinancementDossiersByPropertyAndBroker error', err);
      callback([]);
    }
  );
}

/**
 * Subscribe to dossiers for one property (for Building Dashboard list).
 * @param {string} propertyId
 * @param {string} ownerUid
 * @param {(list: Array<object>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeFinancementDossiersForProperty(propertyId, ownerUid, callback) {
  if (!propertyId || !ownerUid) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(firestore, COLLECTION),
    where('propertyId', '==', propertyId),
    where('ownerUid', '==', ownerUid)
  );
  return onSnapshot(
    q,
    (snapshot) =>
      callback(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(isActiveDossier)
      ),
    (err) => {
      console.warn('subscribeFinancementDossiersForProperty error', err);
      callback([]);
    }
  );
}

function isActiveDossier(d) {
  return d && d.status !== 'cancelled';
}

/**
 * Update dossier (responses, status, checklist). Caller must be owner or broker.
 * @param {string} dossierId
 * @param {{ responses?: object, status?: string, submittedAt?: object, checklistId?: string, checklistSnapshot?: object }} data
 */
export async function updateFinancementDossier(dossierId, data) {
  if (!dossierId) return;
  const docRef = doc(firestore, COLLECTION, dossierId);
  const update = { updatedAt: serverTimestamp() };
  if (data.responses !== undefined) update.responses = data.responses;
  if (data.status !== undefined) update.status = data.status;
  if (data.submittedAt !== undefined) update.submittedAt = data.submittedAt;
  if (data.checklistId !== undefined) update.checklistId = data.checklistId;
  if (data.checklistSnapshot !== undefined) update.checklistSnapshot = data.checklistSnapshot;
  await updateDoc(docRef, update);
}

/**
 * Cancel a financing request (broker or owner). Dossier will be hidden from lists.
 * @param {string} dossierId
 */
export async function cancelFinancementDossier(dossierId) {
  await updateFinancementDossier(dossierId, { status: 'cancelled' });
}

/**
 * Update an existing dossier's checklist (same property+broker). Keeps existing responses.
 * Reopens the dossier (status → in_progress, submittedAt cleared) so the investor can add new items.
 * @param {string} dossierId
 * @param {string} checklistId
 * @param {{ items: Array<object> }} checklistSnapshot
 */
export async function updateFinancementDossierChecklist(dossierId, checklistId, checklistSnapshot) {
  if (!dossierId || !checklistSnapshot?.items) return;
  await updateFinancementDossier(dossierId, {
    checklistId: checklistId || null,
    checklistSnapshot: { items: checklistSnapshot.items },
    status: 'in_progress',
    submittedAt: null,
  });
}

/**
 * Upload a file for a dossier item. Returns fileRef to store in responses[itemId].fileRefs.
 * @param {string} dossierId
 * @param {string} itemId
 * @param {File} file
 * @returns {Promise<{ storagePath: string, name: string, size: number, uploadedAt: string }>}
 */
export async function uploadDossierFile(dossierId, itemId, file) {
  if (!dossierId || !itemId || !file) throw new Error('dossierId, itemId and file required');
  const fileId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${DOSSIER_FILES_PREFIX}/${dossierId}/${itemId}/${fileId}_${safeName}`;
  const storageRefPath = ref(storage, path);
  await uploadBytes(storageRefPath, file);
  return {
    storagePath: path,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
