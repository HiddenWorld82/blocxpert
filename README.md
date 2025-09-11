# 🧠 Rentalyzer – Analyseur de rentabilité immobilière

**Rentalyzer** est une application web développée avec **React + Vite**, permettant aux investisseurs immobiliers d’évaluer rapidement la rentabilité de leurs immeubles multilogements.

---

## 🚀 Fonctionnalités principales

- 📊 Calcul du **cashflow**, du **NOI**, du **cap rate**, et du **cash-on-cash return**
- 🏦 Intégration du **financement conventionnel**, SCHL, et APH Select
- 📋 Visualisation claire des **frais d'acquisition** et de la **mise de fonds**
- 💬 Recommandations automatiques basées sur les données saisies
- 🧠 Interface simple et moderne optimisée avec **TailwindCSS** (optionnel)
- 🔒 Champs verrouillables pour simuler différents scénarios

---

## 🛠️ Technologies utilisées

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/) (facultatif)
- [ESLint](https://eslint.org/) (recommandé)
- [Git + GitHub](https://github.com/)

---

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ton-utilisateur/rentalyzer.git
cd rentalyzer
npm install
npm install @rollup/rollup-win32-x64-msvc
```

### 2. Configurer Firebase

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com/).
2. Ajouter une application web pour obtenir les clés de configuration.
3. Copier `.env.example` vers `.env` et y renseigner les clés Firebase et Google Maps.

### 3. Configurer le serveur PDF (optionnel)

Pour générer des rapports PDF via un serveur externe ou un tunnel (ex.: ngrok), définissez `VITE_PDF_URL` dans votre fichier `.env` :

```bash
VITE_PDF_URL=http://localhost:3001
```

Si la variable n'est pas définie, l'application utilisera l'origine du navigateur (`window.location.origin`).

### 4. Lancer l'application

### 3. Lancer l'application

```bash
npm run dev
```