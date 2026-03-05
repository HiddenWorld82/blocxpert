import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

function checklistsCollection(uid) {
  return collection(firestore, 'users', uid, 'checklists');
}

/**
 * @param {string} uid - broker/lender uid
 * @param {{ name: string, description?: string, items: Array<{ id: string, label: string, requireFile: boolean, order?: number }>, isDefault?: boolean }} data
 * @returns {Promise<string>} checklist id
 */
export async function createChecklist(uid, data) {
  if (!uid) throw new Error('uid required');
  const payload = {
    name: data.name || '',
    description: data.description || '',
    items: data.items || [],
    isDefault: data.isDefault === true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(checklistsCollection(uid), payload);
  return ref.id;
}

/**
 * @param {string} uid
 * @param {string} checklistId
 * @returns {Promise<object | null>}
 */
export async function getChecklist(uid, checklistId) {
  if (!uid || !checklistId) return null;
  const ref = doc(firestore, 'users', uid, 'checklists', checklistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * @param {string} uid
 * @returns {Promise<Array<object>>}
 */
export async function getChecklistsOnce(uid) {
  if (!uid) return [];
  const snapshot = await getDocs(checklistsCollection(uid));
  const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? a.updatedAt?._seconds ?? 0;
    const tb = b.updatedAt?.toMillis?.() ?? b.updatedAt?._seconds ?? 0;
    return tb - ta;
  });
  return list;
}

/**
 * @param {string} uid
 * @param {(checklists: Array<object>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeChecklists(uid, callback) {
  if (!uid) {
    callback([]);
    return () => {};
  }
  return onSnapshot(
    checklistsCollection(uid),
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.updatedAt?.toMillis?.() ?? a.updatedAt?._seconds ?? 0;
        const tb = b.updatedAt?.toMillis?.() ?? b.updatedAt?._seconds ?? 0;
        return tb - ta;
      });
      callback(list);
    },
    (err) => {
      console.warn('subscribeChecklists error', err);
      callback([]);
    }
  );
}

/**
 * @param {string} uid
 * @param {string} checklistId
 * @param {{ name?: string, description?: string, items?: Array<object>, isDefault?: boolean }} data
 */
export async function updateChecklist(uid, checklistId, data) {
  if (!uid || !checklistId) return;
  const ref = doc(firestore, 'users', uid, 'checklists', checklistId);
  const update = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;
  if (data.items !== undefined) update.items = data.items;
  if (data.isDefault !== undefined) update.isDefault = data.isDefault;
  await updateDoc(ref, update);
}

/**
 * If setting isDefault true for one checklist, clear isDefault on others.
 */
export async function setChecklistDefault(uid, checklistId) {
  if (!uid || !checklistId) return;
  const checklists = await getChecklistsOnce(uid);
  await updateChecklist(uid, checklistId, { isDefault: true });
  for (const c of checklists) {
    if (c.id !== checklistId && c.isDefault) {
      await updateChecklist(uid, c.id, { isDefault: false });
    }
  }
}

/**
 * @param {string} uid
 * @param {string} checklistId
 */
export async function deleteChecklist(uid, checklistId) {
  if (!uid || !checklistId) return;
  const ref = doc(firestore, 'users', uid, 'checklists', checklistId);
  await deleteDoc(ref);
}
