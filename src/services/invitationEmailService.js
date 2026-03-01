/**
 * Envoi d'invitation par file Firestore : on écrit un document dans invitationEmails,
 * une Cloud Function envoie le courriel via Resend (hello@dmii.ca) et met à jour le statut.
 */
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'invitationEmails';

/**
 * Enqueue une invitation : crée un document dans invitationEmails.
 * La Cloud Function sendInvitationEmail envoie l'email et met à jour status (sent / error).
 * @param {string} brokerUid - UID du courtier
 * @param {object} payload - { to, clientName, invitationLink, clientId? }
 */
export async function queueInvitationEmail(brokerUid, payload) {
  const { to, clientName, invitationLink, clientId } = payload;
  if (!to || !invitationLink) throw new Error('to and invitationLink required');
  const ref = collection(firestore, COLLECTION);
  const docRef = await addDoc(ref, {
    to: String(to).trim().toLowerCase(),
    clientName: clientName ? String(clientName).trim() : '',
    invitationLink: String(invitationLink),
    brokerUid,
    ...(clientId && { clientId }),
    createdAt: new Date(),
  });
  return docRef.id;
}
