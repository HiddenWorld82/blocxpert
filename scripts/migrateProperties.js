/* eslint-env node */
// Requires the `firebase-admin` package:
//   npm install firebase-admin
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize the Firebase Admin SDK using the default credentials.
initializeApp({ credential: applicationDefault() });

const db = getFirestore();

async function migrate() {
  const propertiesSnapshot = await db.collection('properties').get();
  for (const doc of propertiesSnapshot.docs) {
    const data = doc.data();
    const { address = '', uid, ...scenarioData } = data;

    try {
      // Create a building document using the old property id
      const buildingRef = db.collection('buildings').doc(doc.id);
      await buildingRef.set({ address, uid });

      // Create a scenario inside the new building
      await buildingRef.collection('scenarios').add({
        ...scenarioData,
        address,
        uid,
      });

      // Remove the old property document
      await doc.ref.delete();
      console.log(`Migrated property ${doc.id}`);
    } catch (err) {
      console.error(`Failed to migrate property ${doc.id}`, err);
    }
  }
}

migrate();
