# Cloud Functions Rentalyzer

## Envoi des courriels d'invitation (hello@dmii.ca)

Quand un courtier ajoute un client, l’app écrit un document dans la collection Firestore **`invitationEmails`**. La fonction **`sendInvitationEmail`** se déclenche, envoie l’email via **Resend** depuis **hello@dmii.ca**, puis met à jour le document avec `status: 'sent'` ou `status: 'error'`.

### Prérequis

1. **Compte Resend** : [resend.com](https://resend.com) → créer une clé API.
2. **Domaine dmii.ca** : dans Resend, ajouter et vérifier le domaine pour pouvoir envoyer depuis `hello@dmii.ca`. (Plus tard : rentalyzer.ca.)
3. **Projet Firebase en plan Blaze** (pour déployer des Cloud Functions).

### Configuration

Définir les variables d’environnement des Functions :

**Option A – Console Firebase**  
Functions → votre projet → Configuration (engrenage) → Variables d’environnement :

- **RESEND_API_KEY** : votre clé API Resend (obligatoire).
- **INVITATION_FROM_EMAIL** (optionnel) : par défaut `Rentalyzer <hello@dmii.ca>`.

**Option B – Fichier `.env` dans `functions/`** (pour l’émulateur ou déploiement) :

```env
RESEND_API_KEY=re_xxxx
INVITATION_FROM_EMAIL=Rentalyzer <hello@dmii.ca>
```

Pour le déploiement en production, privilégier les variables configurées dans la console Firebase (secrets).

### Déploiement

```bash
cd functions
pnpm install
cd ..
firebase deploy --only functions
```

### Flux

1. Le courtier crée un client (nom, courriel) dans l’app.
2. L’app crée le client dans `clients/` et un token d’invitation dans `inviteTokens/`.
3. L’app écrit un document dans `invitationEmails/` avec `to`, `clientName`, `invitationLink`, `brokerUid`, `clientId`.
4. La Cloud Function s’exécute, envoie l’email via Resend, puis met à jour le document avec `status` et `processedAt` (et `error` en cas d’échec).

Le client reçoit le courriel avec le lien d’inscription ; le courtier voit aussi le lien dans l’app pour le copier si besoin.
