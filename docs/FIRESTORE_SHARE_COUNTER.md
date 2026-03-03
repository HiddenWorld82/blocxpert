# Compteur de partage (recipientCount)

Le compteur affiché sur la fiche d’un immeuble (« Partagé avec X personnes ») est stocké dans le **document de partage** sous le champ **`recipientCount`**.

## Où regarder dans la console Firestore

### 1. Partages et compteur

- **Collection** : `shares`
- Chaque **document** = un lien de partage (l’ID du document est le token du lien).
- Champs utiles :
  - `uid` : UID du propriétaire (créateur du partage)
  - `propertyId` : ID de l’immeuble
  - **`recipientCount`** : nombre de personnes qui ont ce partage dans « Partagés avec moi » (mis à jour par les Cloud Functions)

**Pour vérifier le compteur** : ouvre le document du partage dans `shares` et regarde le champ **`recipientCount`**. S’il est à 0 ou absent, la fiche affichera « Partagé » (bordure) si l’immeuble a au moins un partage, et le nombre quand `recipientCount` > 0.

### 2. Mise à jour du compteur

- **Création** d’un document dans `users/{userId}/sharedWithMe` → Cloud Function **onSharedWithMeCreated** incrémente `shares/{shareToken}.recipientCount`.
- **Suppression** d’un document dans `sharedWithMe` → Cloud Function **onSharedWithMeDeleted** décrémente `recipientCount`.

Les partages créés **avant** l’ajout de ce système n’ont pas `recipientCount` ; au prochain ajout ou retrait d’un « Partagés avec moi » pour ce partage, les Cloud Functions mettront le champ à jour.

### 3. Déploiement

Après modification des Cloud Functions :

```bash
firebase deploy --only functions
```

Pour les **nouveaux** partages, le champ `recipientCount: 0` est ajouté à la création dans l’app (createShare).
