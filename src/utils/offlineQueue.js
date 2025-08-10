import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const QUEUE_KEY = 'offlineQueue';

const getQueue = () => JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
const saveQueue = (queue) => localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

export const queueOperation = (operation) => {
  const queue = getQueue();
  queue.push(operation);
  saveQueue(queue);
};

export const processQueue = async () => {
  if (!navigator.onLine) return;
  const queue = getQueue();
  for (const op of queue) {
    try {
      if (op.type === 'add') {
        await addDoc(collection(firestore, 'properties'), op.data);
      } else if (op.type === 'update') {
        await updateDoc(doc(firestore, 'properties', op.id), op.data);
      } else if (op.type === 'delete') {
        await deleteDoc(doc(firestore, 'properties', op.id));
      }
    } catch (e) {
      console.error('Failed to process queued operation', e);
    }
  }
  saveQueue([]);
};

window.addEventListener('online', processQueue);

if (navigator.onLine) {
  processQueue();
}
