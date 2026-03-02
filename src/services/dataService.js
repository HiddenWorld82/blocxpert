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

/** Properties created by clients (investors) linked to this broker. */
export const getPropertiesByBroker = (brokerUid, callback) => {
  const q = query(propertiesCollection, where('brokerUid', '==', brokerUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const properties = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        fromClient: true,
      }));
      callback(properties);
    },
    (err) => {
      console.warn('getPropertiesByBroker listener error:', err?.code, err?.message);
      callback([]);
    }
  );
};

export const updateProperty = async (id, data) => {
  if (!navigator.onLine) {
    queueOperation({ type: 'update', id, data });
    return;
  }
  const propertyRef = doc(firestore, 'properties', id);
  await updateDoc(propertyRef, data);
};

export const deleteProperty = async (id) => {
  if (!navigator.onLine) {
    queueOperation({ type: 'delete', id });
    return;
  }
  const propertyRef = doc(firestore, 'properties', id);
  await deleteDoc(propertyRef);
};
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

