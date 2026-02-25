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

Pour générer des rapports PDF via un serveur externe ou un tunnel (ex.: ngrok), définissez idéalement `VITE_PDF_ENDPOINT` dans votre fichier `.env` :

```bash
VITE_PDF_ENDPOINT=http://localhost:3001/api/generate-pdf
```

Vous pouvez aussi définir `VITE_PDF_URL` (base URL), et l'application essaiera automatiquement `/api/generate-pdf` puis `/generate-pdf`.

Si aucune variable n'est définie, l'application utilisera l'origine du navigateur (`window.location.origin`), ce qui peut retourner la page HTML de l'app au lieu d'un PDF en production si le backend PDF n'est pas sur le même domaine.

#### Déploiement cPanel (important)

Sur beaucoup d'hébergements cPanel, Puppeteer ne peut pas lancer Chromium automatiquement (binaire absent ou permissions limitées). Le serveur PDF supporte maintenant **2 modes** :

1. **Navigateur local** (si Chromium/Chrome est disponible sur le serveur)
2. **Navigateur distant** via `PUPPETEER_WS_ENDPOINT` (Browserless, Playwright service, etc.)

Exemple de variables d'environnement pour cPanel :

```bash
# Option A: Chrome local installé sur le serveur
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_CACHE_DIR=/home/<cpanel-user>/.cache/puppeteer

# Option B: navigateur distant (recommandé si Chrome local indisponible)
PUPPETEER_WS_ENDPOINT=wss://<votre-endpoint-browserless>?token=<token>
```

Puis lancez le serveur :

```bash
npm run pdf-server
```

Pour diagnostiquer, utilisez `GET /api/health` : la réponse indique `browserMode` (`local` ou `remote`) et le chemin `executablePath` détecté.

### 4. Lancer l'application

### 3. Lancer l'application

```bash
npm run dev
```
