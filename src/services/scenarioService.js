import { firestore } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';

const scenariosCollection = (buildingId) =>
  collection(firestore, `buildings/${buildingId}/scenarios`);

export const createScenario = async (buildingId, scenario) => {
  const docRef = await addDoc(scenariosCollection(buildingId), scenario);
  return docRef.id;
};

export const getScenarios = (buildingId, callback) => {
  return onSnapshot(scenariosCollection(buildingId), (snapshot) => {
    const scenarios = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(scenarios);
  });
};

export const updateScenario = async (buildingId, scenarioId, data) => {
  const scenarioRef = doc(firestore, `buildings/${buildingId}/scenarios/${scenarioId}`);
  await updateDoc(scenarioRef, data);
};

export const deleteScenario = async (buildingId, scenarioId) => {
  const scenarioRef = doc(firestore, `buildings/${buildingId}/scenarios/${scenarioId}`);
  await deleteDoc(scenarioRef);
};

export const duplicateScenario = async (buildingId, scenarioId, overrides = {}) => {
  const scenarioRef = doc(firestore, `buildings/${buildingId}/scenarios/${scenarioId}`);
  const snapshot = await getDoc(scenarioRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const newScenario = { ...data, ...overrides };
  const newDoc = await addDoc(scenariosCollection(buildingId), newScenario);
  return newDoc.id;
};

export const compareScenarios = (scenarioA, scenarioB) => {
  const diff = {};
  Object.keys(scenarioA).forEach((key) => {
    if (typeof scenarioA[key] === 'number' && typeof scenarioB[key] === 'number') {
      diff[key] = scenarioA[key] - scenarioB[key];
    }
  });
  return diff;
};

