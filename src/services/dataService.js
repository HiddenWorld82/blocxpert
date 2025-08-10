import { firestore } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const propertiesCollection = collection(firestore, 'properties');

export const saveProperty = async (property) => {
  const docRef = await addDoc(propertiesCollection, property);
  return docRef.id;
};

export const getProperties = (callback) =>
  onSnapshot(propertiesCollection, (snapshot) => {
    const properties = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(properties);
  });

export const updateProperty = async (id, data) => {
  const propertyRef = doc(firestore, 'properties', id);
  await updateDoc(propertyRef, data);
};

export const deleteProperty = async (id) => {
  const propertyRef = doc(firestore, 'properties', id);
  await deleteDoc(propertyRef);
};

