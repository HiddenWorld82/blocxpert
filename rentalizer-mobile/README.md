# Rentalyzer Mobile

Application mobile Expo/React Native pour l'analyse de rentabilité immobilière du projet BlocXpert. Cette version reprend les grands principes de l'application web et propose une expérience native avec authentification Firebase et calculs de rentabilité intégrés.

## Prérequis

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/) (`npm install -g expo-cli` facultatif mais pratique)
- Compte Firebase configuré avec les mêmes collections que l'application web

Créez un fichier `.env` (ou configurez vos variables d'environnement) avec les clés suivantes :

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Démarrer le projet

```bash
npm install
npm run start
```

Ensuite, suivez les instructions dans le terminal Expo pour lancer l'application sur un appareil physique (Expo Go) ou un simulateur.

## Fonctionnalités principales

- Authentification par courriel/mot de passe (Firebase Auth)
- Gestion des analyses immobilières avec sauvegarde dans Firestore
- Calculs de rentabilité identiques à la version web (cap rate, cashflow, CoC, projections futures, etc.)
- Support multilingue (français/anglais)
- Indicateur de statut réseau et synchronisation en temps réel

## Structure du projet

```
App.js
src/
  components/
  contexts/
  defaults/
  hooks/
  navigation/
  screens/
  services/
  utils/
```

Chaque écran mobile est contenu dans `src/screens`, tandis que les calculateurs et valeurs par défaut partagés proviennent de `src/utils` et `src/defaults`.

## Tests

Les tests automatisés ne sont pas encore configurés. Vous pouvez toutefois lancer l'application avec Expo pour valider le bon fonctionnement général.
