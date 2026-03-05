import { firestore } from '../config/firebase';
import { queueOperation } from '../utils/offlineQueue';
import { cloneScenario } from '../utils/cloneScenario';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  getDocs,
  deleteField,
} from 'firebase/firestore';

const propertiesCollection = collection(firestore, 'properties');

export const saveProperty = async (property) => {
  if (!navigator.onLine) {
    queueOperation({ type: 'add', data: property });
    return null;
  }
  const docRef = await addDoc(propertiesCollection, property);
  return docRef.id;
};

/**
 * One-time fetch of all properties for a user (e.g. for account deletion).
 * @param {string} uid
 * @returns {Promise<Array<{ id: string, [key: string]: any }>>}
 */
export async function getPropertiesOnce(uid) {
  if (!uid) return [];
  const q = query(propertiesCollection, where('uid', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete a property and all its scenarios. Use when deleting user account.
 * @param {string} propertyId
 */
export async function deletePropertyAndScenarios(propertyId) {
  if (!propertyId) return;
  const scenariosRef = collection(firestore, 'properties', propertyId, 'scenarios');
  const scenariosSnap = await getDocs(scenariosRef);
  await Promise.all(scenariosSnap.docs.map((d) => deleteDoc(d.ref)));
  const propertyRef = doc(firestore, 'properties', propertyId);
  await deleteDoc(propertyRef);
}

/**
 * Delete all properties owned by this user (and their scenarios). Does not clean shares;
 * caller should call shareService.cleanupPropertyShares(uid, propertyId) for each first.
 * @param {string} uid
 */
export async function deleteAllPropertiesForUser(uid) {
  if (!uid) return;
  const props = await getPropertiesOnce(uid);
  for (const p of props) {
    await deletePropertyAndScenarios(p.id);
  }
}

export const getProperties = (uid, callback) => {
  const q = query(propertiesCollection, where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const properties = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(properties);
    },
    (err) => {
      console.warn('getProperties listener error:', err?.code, err?.message);
      callback([]);
    }
  );
};

/**
 * Normalize property from broker view: set brokerUid/clientId for this broker so existing UI keeps working.
 */
function normalizePropertyForBroker(property, brokerUid) {
  const data = { id: property.id, ...property, fromClient: true };
  const uids = property.sharedWithBrokerUids;
  const map = property.sharedWithBrokers;
  if (Array.isArray(uids) && uids.includes(brokerUid)) {
    const clientId = map && typeof map[brokerUid] === 'object' && map[brokerUid] != null
      ? map[brokerUid].clientId
      : (map && typeof map[brokerUid] === 'string' ? map[brokerUid] : undefined);
    data.brokerUid = brokerUid;
    data.clientId = clientId || property.clientId;
  }
  return data;
}

/** Properties created by clients (investors) linked to this broker. Supports multiple brokers per property. */
export const getPropertiesByBroker = (brokerUid, callback) => {
  const emit = (byArray, byLegacy) => {
    const byId = new Map();
    byLegacy.forEach((p) => byId.set(p.id, normalizePropertyForBroker({ ...p, brokerUid: p.brokerUid, clientId: p.clientId }, brokerUid)));
    byArray.forEach((p) => {
      const existing = byId.get(p.id);
      if (!existing) byId.set(p.id, normalizePropertyForBroker(p, brokerUid));
    });
    callback(Array.from(byId.values()));
  };
  const qArray = query(
    propertiesCollection,
    where('sharedWithBrokerUids', 'array-contains', brokerUid)
  );
  const qLegacy = query(propertiesCollection, where('brokerUid', '==', brokerUid));
  let lastArray = [];
  let lastLegacy = [];
  const unsubArray = onSnapshot(
    qArray,
    (snapshot) => {
      lastArray = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      emit(lastArray, lastLegacy);
    },
    (err) => {
      console.warn('getPropertiesByBroker (array) listener error:', err?.code, err?.message);
      emit(lastArray, lastLegacy);
    }
  );
  const unsubLegacy = onSnapshot(
    qLegacy,
    (snapshot) => {
      lastLegacy = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      emit(lastArray, lastLegacy);
    },
    (err) => {
      console.warn('getPropertiesByBroker (legacy) listener error:', err?.code, err?.message);
      emit(lastArray, lastLegacy);
    }
  );
  return () => {
    unsubArray();
    unsubLegacy();
  };
};

export const updateProperty = async (id, data) => {
  if (!navigator.onLine) {
    queueOperation({ type: 'update', id, data });
    return;
  }
  const propertyRef = doc(firestore, 'properties', id);
  await updateDoc(propertyRef, data);
};

/**
 * Add a broker share to a property (supports multiple brokers per property).
 * If the property currently uses legacy brokerUid/clientId only, migrates to sharedWithBrokerUids + sharedWithBrokers.
 * @param {string} propertyId
 * @param {string} brokerUid
 * @param {string} clientId - Client document ID for this broker
 * @param {object} [extra] - Optional extra fields to merge (e.g. shareScenariosWithBroker)
 */
export async function addPropertyBrokerShare(propertyId, brokerUid, clientId, extra = {}) {
  if (!propertyId || !brokerUid || !clientId) return;
  const propertyRef = doc(firestore, 'properties', propertyId);
  const snap = await getDoc(propertyRef);
  if (!snap.exists()) return;
  const data = snap.data();
  let uids = Array.isArray(data.sharedWithBrokerUids) ? [...data.sharedWithBrokerUids] : [];
  let map = data.sharedWithBrokers && typeof data.sharedWithBrokers === 'object'
    ? { ...data.sharedWithBrokers }
    : {};
  if (data.brokerUid && !uids.length) {
    uids = [data.brokerUid];
    map = { [data.brokerUid]: { clientId: data.clientId || '' } };
  }
  if (!uids.includes(brokerUid)) {
    uids.push(brokerUid);
  }
  map[brokerUid] = { clientId };
  const update = {
    sharedWithBrokerUids: uids,
    sharedWithBrokers: map,
    ...extra,
  };
  await updateDoc(propertyRef, update);
}

export const deleteProperty = async (id) => {
  if (!navigator.onLine) {
    queueOperation({ type: 'delete', id });
    return;
  }
  const propertyRef = doc(firestore, 'properties', id);
  await deleteDoc(propertyRef);
};

/**
 * Clear this broker+client from all properties that were shared with them.
 * Call this when a broker deletes a client. Handles both legacy (brokerUid/clientId) and multi-broker (sharedWithBrokerUids) models.
 */
export async function clearBrokerFromClientProperties(brokerUid, clientId) {
  if (!brokerUid || !clientId) return;
  const legacyQ = query(
    propertiesCollection,
    where('clientId', '==', clientId),
    where('brokerUid', '==', brokerUid)
  );
  const arrayQ = query(
    propertiesCollection,
    where('sharedWithBrokerUids', 'array-contains', brokerUid)
  );
  const [legacySnap, arraySnap] = await Promise.all([getDocs(legacyQ), getDocs(arrayQ)]);
  const toUpdate = new Map();
  legacySnap.docs.forEach((d) => toUpdate.set(d.id, { ref: d.ref, data: d.data() }));
  arraySnap.docs.forEach((d) => {
    if (!toUpdate.has(d.id)) toUpdate.set(d.id, { ref: d.ref, data: d.data() });
  });
  await Promise.all(
    Array.from(toUpdate.entries()).map(([id, { ref, data }]) => {
      const uids = Array.isArray(data.sharedWithBrokerUids) ? [...data.sharedWithBrokerUids] : [];
      const map = data.sharedWithBrokers && typeof data.sharedWithBrokers === 'object' ? { ...data.sharedWithBrokers } : {};
      const hasLegacy = data.brokerUid === brokerUid && data.clientId === clientId;
      const inMap = uids.includes(brokerUid) && (map[brokerUid]?.clientId === clientId || map[brokerUid] === clientId);
      if (!hasLegacy && !inMap) return Promise.resolve();
      const nextUids = uids.filter((uid) => uid !== brokerUid);
      const nextMap = { ...map };
      delete nextMap[brokerUid];
      if (nextUids.length === 0) {
        return updateDoc(ref, {
          sharedWithBrokerUids: deleteField(),
          sharedWithBrokers: deleteField(),
          brokerUid: deleteField(),
          clientId: deleteField(),
        });
      }
      const payload = { sharedWithBrokerUids: nextUids, sharedWithBrokers: nextMap };
      if (data.brokerUid === brokerUid) {
        const first = nextUids[0];
        payload.brokerUid = first;
        payload.clientId = nextMap[first]?.clientId ?? nextMap[first] ?? '';
      }
      return updateDoc(ref, payload);
    })
  );
}
/**
 * @param {string} propertyId
 * @param {object} scenario - scenario data (id excluded when creating)
 * @param {string} [creatorUid] - uid of the user creating the scenario (for broker/client: only they can edit/delete their scenarios)
 */
export const saveScenario = async (propertyId, scenario, creatorUid = null) => {
  const scenariosCollection = collection(
    firestore,
    'properties',
    propertyId,
    'scenarios'
  );
  const payload = { ...scenario };
  if (creatorUid != null) payload.createdByUid = creatorUid;
  const docRef = await addDoc(scenariosCollection, payload);
  return docRef.id;
};

export const saveFinancingScenario = async (propertyId, scenario, creatorUid = null) => {
  return saveScenario(propertyId, { ...scenario, type: 'initialFinancing' }, creatorUid);
};

/**
 * Fetch a single scenario by id (e.g. to get parent scenario for renewal).
 */
export const getScenario = async (propertyId, scenarioId) => {
  if (!propertyId || !scenarioId) return null;
  const scenarioRef = doc(
    firestore,
    'properties',
    propertyId,
    'scenarios',
    scenarioId,
  );
  const snap = await getDoc(scenarioRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getScenarios = (
  propertyId,
  callback,
  parentScenarioId = null
) => {
  const scenariosCollection = collection(
    firestore,
    'properties',
    propertyId,
    'scenarios'
  );
  const q =
    parentScenarioId !== null && parentScenarioId !== undefined
      ? query(scenariosCollection, where('parentScenarioId', '==', parentScenarioId))
      : scenariosCollection;
  return onSnapshot(
    q,
    (snapshot) => {
      const scenarios = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(scenarios);
    },
    (err) => {
      console.warn('getScenarios listener error:', err?.code, err?.message);
      callback([]);
    }
  );
};

export const updateScenario = async (propertyId, id, data) => {
  const scenarioRef = doc(
    firestore,
    'properties',
    propertyId,
    'scenarios',
    id
  );
  const { createdByUid: _drop, ...rest } = data;
  await updateDoc(scenarioRef, rest);
};

/**
 * @param {string} [creatorUid] - uid of the user duplicating (new scenario will have this as createdByUid)
 */
export const duplicateScenario = async (propertyId, scenario, creatorUid = null) => {
  const cloned = cloneScenario(scenario);
  const { createdByUid: _drop, ...clonedWithoutCreator } = cloned;
  const newId = await saveScenario(propertyId, clonedWithoutCreator, creatorUid);
  return { id: newId, ...clonedWithoutCreator, createdByUid: creatorUid ?? cloned.createdByUid };
};

export const deleteScenario = async (propertyId, id) => {
  const scenarioRef = doc(
    firestore,
    'properties',
    propertyId,
    'scenarios',
    id
  );
  await deleteDoc(scenarioRef);
};

export const exportProperty = async (propertyId) => {
  const propertyRef = doc(firestore, 'properties', propertyId);
  const propertySnap = await getDoc(propertyRef);
  if (!propertySnap.exists()) return null;
  const property = { id: propertySnap.id, ...propertySnap.data() };
  const scenariosCollection = collection(
    firestore,
    'properties',
    propertyId,
    'scenarios'
  );
  const scenariosSnap = await getDocs(scenariosCollection);
  const scenarios = scenariosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { property, scenarios };
};

export const importSharedProperty = async (data, uid) => {
  const { property, scenarios } = data;
  const { id: _oldId, uid: _oldUid, ...propertyData } = property;
  const newPropertyId = await saveProperty({ ...propertyData, uid });
  const idMap = {};
  for (const sc of scenarios || []) {
    const { id: oldId, parentScenarioId, createdByUid: _drop, ...scData } = sc;
    const newId = await saveScenario(newPropertyId, scData, uid);
    idMap[oldId] = { newId, parentOldId: parentScenarioId };
  }
  for (const { newId, parentOldId } of Object.values(idMap)) {
    if (parentOldId && idMap[parentOldId]) {
      await updateScenario(newPropertyId, newId, {
        parentScenarioId: idMap[parentOldId].newId,
      });
    }
  }
  return newPropertyId;
};

