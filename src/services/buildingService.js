import { firestore } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';

const buildingsCollection = collection(firestore, 'buildings');

export const createBuilding = async (building) => {
  const docRef = await addDoc(buildingsCollection, building);
  return docRef.id;
};

export const getBuildingByAddress = async (address, uid) => {
  const q = query(buildingsCollection, where('address', '==', address), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllBuildings = (uid, callback) => {
  const q = query(buildingsCollection, where('uid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const buildings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(buildings);
  });
};

export const updateBuilding = async (id, data) => {
  const buildingRef = doc(firestore, 'buildings', id);
  await updateDoc(buildingRef, data);
};

export const deleteBuilding = async (id) => {
  const buildingRef = doc(firestore, 'buildings', id);
  await deleteDoc(buildingRef);
};

