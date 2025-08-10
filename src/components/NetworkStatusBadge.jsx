import React from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';

const NetworkStatusBadge = () => {
  const isOnline = useNetworkStatus();
  const color = isOnline ? 'bg-green-500' : 'bg-red-500';
  const label = isOnline ? 'Online' : 'Offline';

  return (
    <div className={`fixed top-2 right-2 px-2 py-1 rounded text-white text-sm ${color}`}>
      {label}
    </div>
  );
};

export default NetworkStatusBadge;
