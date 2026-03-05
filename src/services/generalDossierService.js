import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../config/firebase';
import { GENERAL_DOSSIER_DOC_ID } from '../constants/projectDocumentTypes';

const GENERAL_DOSSIER_STORAGE_PREFIX = 'general-dossier';

function generalDossierRef(propertyId) {
  return doc(firestore, 'properties', propertyId, 'generalDossier', GENERAL_DOSSIER_DOC_ID);
}

/**
 * @param {string} propertyId
 * @returns {Promise<{ documents: Record<string, { fileRefs: Array<{ storagePath: string, name: string, size?: number, uploadedAt: string }> }>, updatedAt?: object } | null>}
 */
export async function getGeneralDossier(propertyId) {
  if (!propertyId) return null;
  const snap = await getDoc(generalDossierRef(propertyId));
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Delete the general dossier (Project Documents) for a property. Used when owner deletes the property.
 * @param {string} propertyId
 */
export async function deleteGeneralDossier(propertyId) {
  if (!propertyId) return;
  await deleteDoc(generalDossierRef(propertyId));
}

/**
 * Listen to general dossier for a property.
 * @param {string} propertyId
 * @param {(data: object | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeGeneralDossier(propertyId, callback) {
  if (!propertyId) {
    callback(null);
    return () => {};
  }
  return onSnapshot(
    generalDossierRef(propertyId),
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => {
      console.warn('subscribeGeneralDossier error', err);
      callback(null);
    }
  );
}

/**
 * Ensure general dossier doc exists and merge documents + sectionOrder.
 * @param {string} propertyId
 * @param {string} ownerUid
 * @param {{ documents?: Record<string, { title: string, fileRefs: Array<object> }>, sectionOrder?: string[] }} data
 */
export async function updateGeneralDossier(propertyId, ownerUid, data) {
  if (!propertyId || !ownerUid) return;
  const documents = data?.documents ?? {};
  const sectionOrder = data?.sectionOrder ?? [];
  const ref = generalDossierRef(propertyId);
  const existing = await getDoc(ref);
  const updatedAt = { _seconds: Math.floor(Date.now() / 1000) };
  if (existing.exists()) {
    await updateDoc(ref, { documents, sectionOrder, updatedAt });
  } else {
    await setDoc(ref, { propertyId, ownerUid, documents, sectionOrder, updatedAt });
  }
}

/**
 * Add a section (user-defined title). Returns the new sectionId.
 * @param {string} propertyId
 * @param {string} ownerUid
 * @param {string} title
 * @returns {Promise<string>} sectionId
 */
export async function addSection(propertyId, ownerUid, title) {
  if (!propertyId || !ownerUid || !title?.trim()) throw new Error('propertyId, ownerUid and title required');
  const sectionId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const data = await getGeneralDossier(propertyId);
  const documents = { ...(data?.documents || {}) };
  const sectionOrder = [...(data?.sectionOrder || [])];
  documents[sectionId] = { title: title.trim(), fileRefs: [] };
  sectionOrder.push(sectionId);
  await updateGeneralDossier(propertyId, ownerUid, { documents, sectionOrder });
  return sectionId;
}

/**
 * Update a section title.
 */
export async function updateSectionTitle(propertyId, ownerUid, sectionId, title) {
  if (!propertyId || !ownerUid || !sectionId) return;
  const data = await getGeneralDossier(propertyId);
  const documents = { ...(data?.documents || {}) };
  const section = documents[sectionId];
  if (!section) return;
  documents[sectionId] = { ...section, title: (title || section.title || '').trim() };
  await updateGeneralDossier(propertyId, ownerUid, { documents, sectionOrder: data?.sectionOrder || [] });
}

/**
 * Delete a section and all its files from Storage.
 */
export async function deleteSection(propertyId, ownerUid, sectionId) {
  if (!propertyId || !ownerUid || !sectionId) return;
  const data = await getGeneralDossier(propertyId);
  const documents = { ...(data?.documents || {}) };
  const section = documents[sectionId];
  if (section?.fileRefs) {
    for (const fileRef of section.fileRefs) {
      try {
        const r = ref(storage, fileRef.storagePath);
        await deleteObject(r);
      } catch (e) {
        console.warn('deleteSection: deleteObject', fileRef.storagePath, e);
      }
    }
  }
  delete documents[sectionId];
  const sectionOrder = (data?.sectionOrder?.length ? data.sectionOrder : Object.keys(data?.documents || {})).filter((id) => id !== sectionId);
  await updateGeneralDossier(propertyId, ownerUid, { documents, sectionOrder });
}

/**
 * Upload a file to Documents du projet for a given section.
 * @param {string} propertyId
 * @param {string} sectionId
 * @param {File} file
 * @returns {Promise<{ storagePath: string, name: string, size: number, uploadedAt: string }>}
 */
export async function uploadGeneralDossierFile(propertyId, sectionId, file) {
  if (!propertyId || !sectionId || !file) throw new Error('propertyId, sectionId and file required');
  const fileId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const path = `${GENERAL_DOSSIER_STORAGE_PREFIX}/${propertyId}/${sectionId}/${fileId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRefPath = ref(storage, path);
  await uploadBytes(storageRefPath, file);
  const uploadedAt = new Date().toISOString();
  return { storagePath: path, name: file.name, size: file.size, uploadedAt };
}

/**
 * Get download URL for a file in general dossier (by storage path).
 * @param {string} storagePath
 * @returns {Promise<string>}
 */
export async function getGeneralDossierFileDownloadUrl(storagePath) {
  if (!storagePath) throw new Error('storagePath required');
  const r = ref(storage, storagePath);
  return getDownloadURL(r);
}

/**
 * Delete a file from Storage and remove its ref from the dossier doc.
 * @param {string} propertyId
 * @param {string} ownerUid
 * @param {string} sectionId
 * @param {{ storagePath: string }} fileRef
 */
export async function deleteGeneralDossierFile(propertyId, ownerUid, sectionId, fileRef) {
  if (!propertyId || !ownerUid || !fileRef?.storagePath) return;
  try {
    const r = ref(storage, fileRef.storagePath);
    await deleteObject(r);
  } catch (e) {
    console.warn('deleteGeneralDossierFile: deleteObject failed', e);
  }
  const data = await getGeneralDossier(propertyId);
  const documents = { ...(data?.documents || {}) };
  const sectionOrder = (data?.sectionOrder?.length ? data.sectionOrder : Object.keys(documents));
  const section = documents[sectionId];
  if (section?.fileRefs) {
    const fileRefs = section.fileRefs.filter((f) => f.storagePath !== fileRef.storagePath);
    documents[sectionId] = { ...section, fileRefs };
    await updateGeneralDossier(propertyId, ownerUid, { documents, sectionOrder });
  }
}

/**
 * Add a file ref to the dossier doc (after upload). Merges with existing fileRefs for that section.
 */
export async function addFileRefToGeneralDossier(propertyId, ownerUid, sectionId, fileRef) {
  if (!propertyId || !ownerUid || !sectionId || !fileRef) return;
  const data = await getGeneralDossier(propertyId);
  const documents = { ...(data?.documents || {}) };
  const sectionOrder = (data?.sectionOrder?.length ? data.sectionOrder : Object.keys(documents));
  const section = documents[sectionId] || { title: '', fileRefs: [] };
  documents[sectionId] = {
    ...section,
    fileRefs: [...(section.fileRefs || []), fileRef],
  };
  await updateGeneralDossier(propertyId, ownerUid, { documents, sectionOrder });
}
