/**
 * Cloud Functions Rentalyzer
 * - Envoi des courriels d'invitation (trigger Firestore) depuis hello@dmii.ca via Resend
 *
 * Config Firebase (firebase functions:config:set ou Variables dans la console) :
 * - RESEND_API_KEY : clé API Resend
 * - INVITATION_FROM_EMAIL (optionnel) : ex. "Rentalyzer <hello@dmii.ca>"
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";

initializeApp();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = "Rentalyzer <hello@dmii.ca>";

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
