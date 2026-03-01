import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, updateDoc, deleteDoc, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { exportProperty } from './dataService';

const COLLECTION = 'shares';
const SCENARIOS_SUB = 'scenarios';
const USERS_COLLECTION = 'users';
const SHARED_WITH_ME = 'sharedWithMe';

function generateToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * Create a share link for a property (and optionally a specific scenario).
 * @param {string} uid - Owner uid
 * @param {object} opts - { propertyId, scenarioId?, access: 'read' | 'write', allowSubScenariosEdit?: boolean }
 * @returns {Promise<{ token: string, url: string }>}
 */
export async function createShare(uid, opts) {
  const { propertyId, scenarioId = null, access = 'read', allowSubScenariosEdit = false } = opts;
  const snapshot = await exportProperty(propertyId);
  if (!snapshot) throw new Error('Property not found');
  const token = generateToken();
  const ref = doc(firestore, COLLECTION, token);
  await setDoc(ref, {
    uid,
    propertyId,
    scenarioId,
    access,
    allowSubScenariosEdit,
    createdAt: new Date(),
    snapshot: {
      property: snapshot.property,
      scenarios: snapshot.scenarios || [],
    },
  });
  if (typeof window === 'undefined') return { token, url: '', snapshot: snapshot };
  const hash = window.location.hash || '#/';
  const sep = hash.includes('?') ? '&' : '?';
  const url = `${window.location.origin}${window.location.pathname}${hash}${sep}share=${token}`;
  return { token, url, snapshot };
}

/**
 * Get share data by token (allowed for anyone with the link).
 */
export async function getShare(token) {
  if (!token) return null;
  const ref = doc(firestore, COLLECTION, token);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Build a small preview from snapshot.property for sharedWithMe card.
 */
function buildPreview(snapshot) {
  const p = snapshot?.property || {};
  return {
    address: p.address,
    city: p.city,
    province: p.province,
    postalCode: p.postalCode,
    purchasePrice: p.purchasePrice,
    numberOfUnits: p.numberOfUnits,
    effectiveNetIncome: p.effectiveNetIncome,
  };
}

/**
 * Deliver a share to an existing user (appears in their dashboard with "New").
 * @param {string} recipientUid
 * @param {string} fromUid
 * @param {string} shareToken
 * @param {object} snapshot - from createShare result (snapshot.property, snapshot.scenarios)
 */
export async function addSharedWithMe(recipientUid, fromUid, shareToken, snapshot) {
  const ref = collection(firestore, USERS_COLLECTION, recipientUid, SHARED_WITH_ME);
  await addDoc(ref, {
    fromUid,
    shareToken,
    seen: false,
    createdAt: new Date(),
    ...buildPreview(snapshot),
  });
}

/**
 * One-time fetch of shared-with-me items (for refresh/filter when investor views the list).
 */
export async function getSharedWithMeOnce(uid) {
  if (!uid) return [];
  const ref = collection(firestore, USERS_COLLECTION, uid, SHARED_WITH_ME);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch sharedWithMe once, remove orphans (share no longer exists), update Firestore, return filtered list.
 * Call this when the investor views "Partagés avec moi" so deleted shares disappear without waiting for a snapshot.
 */
export async function refreshSharedWithMeList(uid) {
  if (!uid) return [];
  const items = await getSharedWithMeOnce(uid);
  return filterOrphanSharedWithMe(uid, items);
}

/**
 * Listen to shared-with-me items for the current user.
 * Entries whose share no longer exists (e.g. broker deleted the property) are filtered out
 * and removed from Firestore so they disappear from "Partagés avec moi".
 */
export function getSharedWithMe(uid, callback) {
  if (!uid) return () => {};
  const ref = collection(firestore, USERS_COLLECTION, uid, SHARED_WITH_ME);
  return onSnapshot(
    ref,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      filterOrphanSharedWithMe(uid, items).then(callback).catch((e) => {
        console.warn('getSharedWithMe filterOrphan error', e);
        callback(items);
      });
    },
    (err) => {
      console.warn('getSharedWithMe error:', err?.code, err?.message);
      callback([]);
    }
  );
}

/**
 * Remove entries whose share no longer exists (broker deleted the property) and return the rest.
 * The current user (recipient) can delete their own sharedWithMe docs, so we clean orphans here.
 */
async function filterOrphanSharedWithMe(uid, items) {
  if (!items.length) return items;
  const results = await Promise.all(
    items.map(async (item) => {
      const share = await getShare(item.shareToken);
      return { item, shareExists: !!share };
    })
  );
  const toKeep = results.filter((r) => r.shareExists).map((r) => r.item);
  const toRemove = results.filter((r) => !r.shareExists).map((r) => r.item);
  await Promise.all(
    toRemove.map((item) =>
      removeSharedWithMe(uid, item.id, item.shareToken).catch((e) =>
        console.warn('removeSharedWithMe orphan', item.id, e)
      )
    )
  );
  return toKeep;
}

/**
 * Mark a shared-with-me item as seen.
 */
export async function markSharedWithMeSeen(recipientUid, docId) {
  const ref = doc(firestore, USERS_COLLECTION, recipientUid, SHARED_WITH_ME, docId);
  await updateDoc(ref, { seen: true });
}

/**
 * Delete all scenarios in a share that were created by the given user (e.g. when they remove the share from their dashboard).
 */
export async function deleteShareScenariosByCreator(token, creatorUid) {
  if (!token || !creatorUid) return;
  const snapshot = await getDocs(shareScenariosRef(token));
  const toDelete = snapshot.docs.filter((d) => d.data().createdByUid === creatorUid);
  await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
}

/**
 * Remove a shared-with-me item from the recipient's dashboard (does not affect the creator's property).
 * If shareToken is provided, also deletes all sub-scenarios created by this recipient in that share.
 * If the share was already deleted (e.g. broker deleted the property), we still remove the sharedWithMe doc.
 */
export async function removeSharedWithMe(recipientUid, docId, shareToken = null) {
  if (shareToken && recipientUid) {
    try {
      await deleteShareScenariosByCreator(shareToken, recipientUid);
    } catch (e) {
      console.warn('removeSharedWithMe: deleteShareScenariosByCreator skipped (share may be deleted)', e);
    }
  }
  const ref = doc(firestore, USERS_COLLECTION, recipientUid, SHARED_WITH_ME, docId);
  await deleteDoc(ref);
}

// --- Share scenarios (when access === 'write') ---

function shareScenariosRef(token) {
  return collection(firestore, COLLECTION, token, SCENARIOS_SUB);
}

/**
 * Listen to scenarios added to a share (subcollection). Used when share access is 'write'.
 */
export function getShareScenarios(token, callback, parentScenarioId = null) {
  if (!token) return () => {};
  const ref = shareScenariosRef(token);
  const q = parentScenarioId != null
    ? query(ref, where('parentScenarioId', '==', parentScenarioId))
    : ref;
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => {
      console.warn('getShareScenarios error:', err?.code, err?.message);
      callback([]);
    }
  );
}

/**
 * @param {string} token
 * @param {object} scenario
 * @param {{ createdByUid: string, createdByName?: string }} [creatorInfo] - creator of the scenario (for visibility: only that client sees it; broker sees all with this label)
 */
export async function saveShareScenario(token, scenario, creatorInfo = null) {
  const ref = shareScenariosRef(token);
  const { id: _id, createdByUid: _cu, createdByName: _cn, ...data } = scenario;
  const payload = {
    ...data,
    type: data.type || 'initialFinancing',
    ...(creatorInfo && {
      createdByUid: creatorInfo.createdByUid,
      createdByName: creatorInfo.createdByName || '',
    }),
  };
  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

export async function updateShareScenario(token, scenarioId, data) {
  const ref = doc(firestore, COLLECTION, token, SCENARIOS_SUB, scenarioId);
  const { id: _id, createdByUid: _cu, createdByName: _cn, ...rest } = data;
  await updateDoc(ref, rest);
}

export async function deleteShareScenario(token, scenarioId) {
  const ref = doc(firestore, COLLECTION, token, SCENARIOS_SUB, scenarioId);
  await deleteDoc(ref);
}

export async function duplicateShareScenario(token, scenario, creatorInfo = null) {
  const { id: _id, createdByUid: _cu, createdByName: _cn, ...data } = scenario;
  return saveShareScenario(token, data, creatorInfo);
}

/**
 * One-time read of all scenarios in a share (e.g. for broker aggregating from multiple shares).
 */
export async function getShareScenariosOnce(token) {
  if (!token) return [];
  const snapshot = await getDocs(shareScenariosRef(token));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * List shares for a given property (by owner uid). Used by broker to load all client sub-scenarios.
 * Requires composite index on (uid, propertyId) if not already present.
 */
export async function getSharesByProperty(uid, propertyId) {
  if (!uid || !propertyId) return [];
  const ref = collection(firestore, COLLECTION);
  const q = query(ref, where('uid', '==', uid), where('propertyId', '==', propertyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete all sharedWithMe entries that reference this share token (collection group query).
 * Called by the share owner when they delete the property so clients lose the shared entry.
 */
export async function deleteSharedWithMeEntriesByShareToken(shareToken) {
  if (!shareToken) return;
  const ref = collectionGroup(firestore, SHARED_WITH_ME);
  const q = query(ref, where('shareToken', '==', shareToken));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}

/**
 * When the broker deletes a property: remove the share from all clients' dashboards and delete share docs.
 * If deleting sharedWithMe entries fails (e.g. permissions), we still delete the share doc and scenarios
 * so the broker can delete the property; investors will see a missing share when they open the link.
 */
export async function cleanupPropertyShares(ownerUid, propertyId) {
  if (!ownerUid || !propertyId) return;
  let shares;
  try {
    shares = await getSharesByProperty(ownerUid, propertyId);
  } catch (e) {
    throw new Error('getSharesByProperty: ' + (e?.message || e));
  }
  for (const share of shares) {
    try {
      await deleteSharedWithMeEntriesByShareToken(share.id);
    } catch (e) {
      console.warn('cleanupPropertyShares: could not delete sharedWithMe entries for share', share.id, e);
      // Continue: we still delete the share doc so the property can be removed; investors will get "share missing" when opening.
    }
    try {
      const scenariosSnap = await getDocs(shareScenariosRef(share.id));
      await Promise.all(scenariosSnap.docs.map((d) => deleteDoc(d.ref)));
    } catch (e) {
      throw new Error('delete share scenarios(' + share.id + '): ' + (e?.message || e));
    }
    try {
      await deleteDoc(doc(firestore, COLLECTION, share.id));
    } catch (e) {
      throw new Error('delete share doc(' + share.id + '): ' + (e?.message || e));
    }
  }
}
