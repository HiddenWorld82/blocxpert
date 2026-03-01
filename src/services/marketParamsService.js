import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'marketParams';

export function getMarketParamsVersions(uid, callback) {
  if (!uid) return () => {};
  const ref = collection(firestore, COLLECTION);
  const q = query(ref, where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const versions = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? d.data().createdAt,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(versions);
    },
    (err) => {
      console.warn('getMarketParamsVersions listener error:', err?.code, err?.message);
      callback([]);
    }
  );
}

export async function createMarketParamsVersion(uid, data) {
  const ref = collection(firestore, COLLECTION);
  const docRef = await addDoc(ref, {
    uid,
    label: data.label || 'Sans titre',
    version: data.version ?? 1,
    createdAt: new Date(),
    data: data.data || {},
  });
  return docRef.id;
}

export async function getMarketParamsById(docId) {
  const ref = doc(firestore, COLLECTION, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    ...d,
    createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? d.createdAt,
  };
}
