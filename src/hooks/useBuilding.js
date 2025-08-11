// hooks/useBuilding.js
import { useEffect, useState } from 'react';
import { getAllBuildings } from '../services/buildingService';
import { useAuth } from '../contexts/AuthContext';

const useBuilding = (buildingId) => {
  const { currentUser } = useAuth();
  const [building, setBuilding] = useState(null);

  useEffect(() => {
    let unsubscribe;
    if (currentUser?.uid && buildingId) {
      unsubscribe = getAllBuildings(currentUser.uid, (list) => {
        const found = list.find((b) => b.id === buildingId) || null;
        setBuilding(found);
      });
    } else {
      setBuilding(null);
    }
    return () => unsubscribe && unsubscribe();
  }, [buildingId, currentUser]);

  return building;
};

export default useBuilding;
