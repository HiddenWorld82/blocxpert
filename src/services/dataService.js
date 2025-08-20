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
  const q = parentScenarioId
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

