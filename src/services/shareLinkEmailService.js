/**
 * Envoi du lien de partage par courriel (personne sans compte).
 * On écrit dans shareLinkEmails, une Cloud Function envoie via Resend.
 */
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const COLLECTION = 'shareLinkEmails';

/**
 * Enqueue l'envoi du lien de partage par courriel.
 * @param {object} payload - { to, shareLink, senderName? }
 */
export async function queueShareLinkEmail(payload) {
  const { to, shareLink, senderName } = payload;
  if (!to || !shareLink) throw new Error('to and shareLink required');
  const ref = collection(firestore, COLLECTION);
  const docRef = await addDoc(ref, {
    to: String(to).trim().toLowerCase(),
    shareLink: String(shareLink),
    senderName: senderName ? String(senderName).trim() : '',
    createdAt: new Date(),
  });
  return docRef.id;
}
