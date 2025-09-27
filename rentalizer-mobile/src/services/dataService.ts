// src/services/dataService.ts
import { firestore } from '../config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { Property } from '../types';

const propertiesCollection = collection(firestore, 'properties');

export const saveProperty = async (property: Omit<Property, 'id'>) => {
  try {
    const docRef = await addDoc(propertiesCollection, {
      ...property,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving property:', error);
    throw new Error('Impossible de sauvegarder la propriété');
  }
};

export const getProperties = (uid: string, callback: (properties: Property[]) => void) => {
  const q = query(
    propertiesCollection, 
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Property[];
    callback(properties);
  });
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  try {
    const propertyRef = doc(firestore, 'properties', id);
    await updateDoc(propertyRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Impossible de mettre à jour la propriété');
  }
};

export const deleteProperty = async (id: string) => {
  try {
    const propertyRef = doc(firestore, 'properties', id);
    await deleteDoc(propertyRef);
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Impossible de supprimer la propriété');
  }
};

// Fonction pour calculer des métriques de base
export const calculateBasicMetrics = (property: Property) => {
  const purchasePrice = property.purchasePrice || 0;
  const numberOfUnits = property.numberOfUnits || 1;
  const annualRent = property.annualRent || 0;
  
  const pricePerDoor = purchasePrice / numberOfUnits;
  const grossRentMultiplier = purchasePrice > 0 ? purchasePrice / annualRent : 0;
  const monthlyRentPerDoor = annualRent / numberOfUnits / 12;
  
  return {
    pricePerDoor,
    grossRentMultiplier,
    monthlyRentPerDoor,
  };
};