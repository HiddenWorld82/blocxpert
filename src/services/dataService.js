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
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(properties);
  });
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
export const saveScenario = async (propertyId, scenario) => {
  const scenariosCollection = collection(
    firestore,
    'properties',
    propertyId,
    'scenarios'
  );
  const docRef = await addDoc(scenariosCollection, scenario);
  return docRef.id;
};

export const saveFinancingScenario = async (propertyId, scenario) => {
  return saveScenario(propertyId, { ...scenario, type: 'initialFinancing' });
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
  return onSnapshot(q, (snapshot) => {
    const scenarios = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(scenarios);
  });
};

export const updateScenario = async (propertyId, id, data) => {
  const scenarioRef = doc(
    firestore,
    'properties',
    propertyId,
    'scenarios',
    id
  );
  await updateDoc(scenarioRef, data);
};

export const duplicateScenario = async (propertyId, scenario) => {
  const cloned = cloneScenario(scenario);
  const newId = await saveScenario(propertyId, cloned);
  return { id: newId, ...cloned };
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
    const { id: oldId, parentScenarioId, ...scData } = sc;
    const newId = await saveScenario(newPropertyId, scData);
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

