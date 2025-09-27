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
  getDocs
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const propertiesCollection = collection(firestore, 'properties');

export const saveProperty = async (property) => {
  const docRef = await addDoc(propertiesCollection, property);
  return docRef.id;
};

export const getProperties = (uid, callback) => {
  const q = query(propertiesCollection, where('uid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

export const updateProperty = async (id, data) => {
  const ref = doc(firestore, 'properties', id);
  await updateDoc(ref, data);
};

export const deleteProperty = async (id) => {
  const ref = doc(firestore, 'properties', id);
  await deleteDoc(ref);
};

export const exportProperty = async (propertyId) => {
  const propertyRef = doc(firestore, 'properties', propertyId);
  const propertySnap = await getDoc(propertyRef);
  if (!propertySnap.exists()) return null;
  const property = { id: propertySnap.id, ...propertySnap.data() };

  const scenariosCollection = collection(firestore, 'properties', propertyId, 'scenarios');
  const scenariosSnap = await getDocs(scenariosCollection);
  const scenarios = scenariosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { property, scenarios };
};

export const importSharedProperty = async (data, uid) => {
  const { property, scenarios } = data;
  const { id: _oldId, uid: _oldUid, ...propertyData } = property;
  const newPropertyId = await saveProperty({ ...propertyData, uid });

  const scenariosCollection = collection(firestore, 'properties', newPropertyId, 'scenarios');
  const idMap = {};

  for (const scenario of scenarios || []) {
    const { id, parentScenarioId, ...scenarioData } = scenario;
    const docRef = await addDoc(scenariosCollection, scenarioData);
    idMap[id] = { newId: docRef.id, parentScenarioId };
  }

  for (const [oldId, { newId, parentScenarioId }] of Object.entries(idMap)) {
    if (parentScenarioId && idMap[parentScenarioId]) {
      const scenarioRef = doc(scenariosCollection, newId);
      await updateDoc(scenarioRef, { parentScenarioId: idMap[parentScenarioId].newId });
    }
  }

  return newPropertyId;
};
