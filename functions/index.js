/**
 * Cloud Functions Rentalyzer
 * - Envoi des courriels d'invitation (trigger Firestore) depuis hello@rentalyzer.ca via Resend
 *
 * Config Firebase (firebase functions:config:set ou Variables dans la console) :
 * - RESEND_API_KEY : clé API Resend
 * - INVITATION_FROM_EMAIL (optionnel) : ex. "Rentalyzer <hello@rentalyzer.ca>"
 */

import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = "Rentalyzer <hello@rentalyzer.ca>";

/**
 * Quand un document est créé dans invitationEmails, envoie l'email via Resend
 * puis met à jour le document avec status (sent / error).
 *
 * Structure du document:
 * - to (string, obligatoire)
 * - clientName (string, optionnel)
 * - invitationLink (string, obligatoire)
 * - brokerUid (string, optionnel)
 * - clientId (string, optionnel)
 */
export const sendInvitationEmail = onDocumentCreated(
  {
    document: "invitationEmails/{docId}",
    region: "us-central1",
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    console.log("sendInvitationEmail triggered");
    const snap = event.data;
    if (!snap) {
      console.log("sendInvitationEmail: no snapshot");
      return;
    }

    const data = snap.data();
    const { to, clientName, invitationLink } = data;
    console.log("sendInvitationEmail: to=", to, "link length=", invitationLink?.length);

    const ref = snap.ref;

    const updateStatus = async (status, errorMessage = null) => {
      await ref.update({
        status,
        processedAt: new Date(),
        ...(errorMessage && { error: errorMessage }),
      });
    };

    if (!to || !invitationLink) {
      console.log("sendInvitationEmail: missing to or invitationLink");
      await updateStatus("error", "to and invitationLink required");
      return;
    }

    const apiKey = RESEND_API_KEY.value();
    if (!apiKey) {
      console.log("sendInvitationEmail: RESEND_API_KEY not set");
      await updateStatus("error", "RESEND_API_KEY not configured");
      return;
    }

    const subject = "Invitation à rejoindre Rentalyzer";
    const html = `
      <p>Bonjour${clientName ? ` ${clientName}` : ""},</p>
      <p>Votre courtier hypothécaire vous invite à utiliser Rentalyzer pour ajouter votre immeuble et les revenus/dépenses d'exploitation.</p>
      <p>Cliquez sur le lien ci-dessous pour créer votre compte (vous serez inscrit en tant qu'investisseur immobilier) :</p>
      <p><a href="${invitationLink}" style="color:#2563eb;">${invitationLink}</a></p>
      <p>À bientôt sur Rentalyzer.</p>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend error:", res.status, errText);
        await updateStatus("error", errText.slice(0, 500));
        return;
      }

      console.log("sendInvitationEmail: email sent to", to);
      await updateStatus("sent");
    } catch (e) {
      console.error("sendInvitationEmail error:", e);
      await updateStatus("error", (e && e.message) || "Send failed");
    }
  }
);

/**
 * Quand un document est créé dans shareLinkEmails, envoie le lien de partage par Resend.
 * Structure: to, shareLink, senderName?
 */
export const sendShareLinkEmail = onDocumentCreated(
  {
    document: "shareLinkEmails/{docId}",
    region: "us-central1",
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    const { to, shareLink, senderName } = data;
    const ref = snap.ref;
    const updateStatus = async (status, errorMessage = null) => {
      await ref.update({
        status,
        processedAt: new Date(),
        ...(errorMessage && { error: errorMessage }),
      });
    };
    if (!to || !shareLink) {
      await updateStatus("error", "to and shareLink required");
      return;
    }
    const apiKey = RESEND_API_KEY.value();
    if (!apiKey) {
      await updateStatus("error", "RESEND_API_KEY not configured");
      return;
    }
    const subject = "Un immeuble partagé avec vous (Rentalyzer)";
    const html = `
      <p>Bonjour,</p>
      <p>${senderName ? `${senderName} vous a partagé un immeuble.` : "Quelqu'un vous a partagé un immeuble."}</p>
      <p>Ouvrez le lien ci-dessous pour le consulter :</p>
      <p><a href="${shareLink}" style="color:#2563eb;">${shareLink}</a></p>
      <p>À bientôt sur Rentalyzer.</p>
    `;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        await updateStatus("error", errText.slice(0, 500));
        return;
      }
      await updateStatus("sent");
    } catch (e) {
      await updateStatus("error", (e && e.message) || "Send failed");
    }
  }
);

/**
 * Quand un document est créé dans users/{userId}/sharedWithMe, incrémente shares/{shareToken}.recipientCount.
 * Permet d'afficher le compteur sur la fiche immeuble sans requête "collection group" (règles Firestore).
 */
export const onSharedWithMeCreated = onDocumentCreated(
  {
    document: "users/{userId}/sharedWithMe/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const shareToken = snap.data().shareToken;
    if (!shareToken) return;
    try {
      const shareRef = db.doc(`shares/${shareToken}`);
      await shareRef.update({ recipientCount: FieldValue.increment(1) });
    } catch (e) {
      console.warn("onSharedWithMeCreated: update failed", shareToken, e?.message);
    }
  }
);

/**
 * Quand un document est supprimé de users/{userId}/sharedWithMe, décrémente shares/{shareToken}.recipientCount.
 */
export const onSharedWithMeDeleted = onDocumentDeleted(
  {
    document: "users/{userId}/sharedWithMe/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const shareToken = snap.data().shareToken;
    if (!shareToken) return;
    try {
      const shareRef = db.doc(`shares/${shareToken}`);
      await shareRef.update({ recipientCount: FieldValue.increment(-1) });
    } catch (e) {
      console.warn("onSharedWithMeDeleted: update failed", shareToken, e?.message);
    }
  }
);

/**
 * Quand un courtier supprime un client (doc clients/{clientId}), on retire le lien courtier
 * côté investisseur pour qu'il ne voie plus "Partager avec mon courtier" pour ce courtier.
 */
export const onClientDeleted = onDocumentDeleted(
  {
    document: "clients/{clientId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    const clientUserId = data?.clientUserId;
    const brokerUid = data?.uid;
    if (!clientUserId || !brokerUid) return;
    try {
      const brokerLinkRef = db.doc(`users/${clientUserId}/brokerLinks/${brokerUid}`);
      await brokerLinkRef.delete();
    } catch (e) {
      console.warn("onClientDeleted: delete brokerLink failed", clientUserId, brokerUid, e?.message);
    }
  }
);
