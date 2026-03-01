import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'clients';
const INVITE_TOKENS = 'inviteTokens';

function generateInvitationToken() {
  return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}

export async function getClient(clientId) {
  if (!clientId) return null;
  const ref = doc(firestore, COLLECTION, clientId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function getClients(uid, callback) {
  if (!uid) return () => {};
  const q = query(
    collection(firestore, COLLECTION),
    where('uid', '==', uid)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const clients = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(clients);
    },
    (err) => {
      console.warn('getClients listener error:', err?.code, err?.message);
      callback([]);
    }
  );
}

/**
 * Create client and invitation token. Returns { clientId, invitationToken, invitationLink }.
 * Call sendInvitationEmail() or use invitationLink as needed.
 */
export async function createClient(uid, data) {
  const ref = collection(firestore, COLLECTION);
  const invitationToken = generateInvitationToken();
  const docRef = await addDoc(ref, {
    uid,
    name: data.name || '',
    email: (data.email || '').trim().toLowerCase(),
    invitationToken,
    invitationSentAt: null,
    clientUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const clientId = docRef.id;
  const inviteRef = doc(firestore, INVITE_TOKENS, invitationToken);
  await setDoc(inviteRef, {
    clientId,
    brokerUid: uid,
    email: (data.email || '').trim().toLowerCase(),
    clientName: data.name || '',
  });
  const base = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/signup?invitation=${invitationToken}`
    : '';
  return { clientId, invitationToken, invitationLink: base };
}

export async function updateClient(clientId, data) {
  const ref = doc(firestore, COLLECTION, clientId);
  const payload = { ...data, updatedAt: new Date() };
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
  await updateDoc(ref, clean);
}

/** Mark invitation as sent (e.g. after email sent). */
export async function markInvitationSent(clientId) {
  const ref = doc(firestore, COLLECTION, clientId);
  await updateDoc(ref, { invitationSentAt: new Date(), updatedAt: new Date() });
}

/** Get invite data by token (for signup page). Anyone with the link can read. */
export async function getInviteByToken(token) {
  if (!token) return null;
  const ref = doc(firestore, INVITE_TOKENS, token);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Delete a client. If the client had linked their account (clientUserId), clear their
 * broker association so they no longer see "Share with broker".
 */
export async function deleteClient(clientId) {
  const ref = doc(firestore, COLLECTION, clientId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    const clientUserId = data?.clientUserId;
    if (clientUserId) {
      const { clearBrokerLink } = await import('./userProfileService');
      await clearBrokerLink(clientUserId).catch((e) =>
        console.warn('deleteClient: clearBrokerLink failed', e)
      );
    }
  }
  await deleteDoc(ref);
}
