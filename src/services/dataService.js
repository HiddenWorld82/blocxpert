import { firestore } from '../config/firebase';
import { queueOperation } from '../utils/offlineQueue';
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

export const saveFinancingScenario = async (propertyId, scenario) => {
  const scenariosCollection = collection(
    firestore,
    'properties',
    propertyId,
    'scenarios'
  );
  const docRef = await addDoc(scenariosCollection, {
    ...scenario,
    type: 'initialFinancing',
  });
  return docRef.id;
};

