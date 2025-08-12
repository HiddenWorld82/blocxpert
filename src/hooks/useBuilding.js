// hooks/useBuilding.js
import { useCallback, useEffect, useState } from 'react';
import {
  getAllBuildings,
  updateBuilding as updateBuildingService,
  deleteBuilding as deleteBuildingService
} from '../services/buildingService';
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

  const updateBuilding = useCallback(
    async (data) => {
      if (!buildingId) return;
      await updateBuildingService(buildingId, data);
    },
    [buildingId]
  );

  const deleteBuilding = useCallback(async () => {
    if (!buildingId) return;
    await deleteBuildingService(buildingId);
  }, [buildingId]);

  return { building, updateBuilding, deleteBuilding };
};

export default useBuilding;
