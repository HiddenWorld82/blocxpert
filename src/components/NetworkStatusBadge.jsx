import React from 'react';
import useNetworkStatus from '../hooks/useNetworkStatus';
import { useLanguage } from '../contexts/LanguageContext';

const NetworkStatusBadge = () => {
  const isOnline = useNetworkStatus();
  const { t } = useLanguage();
  const color = isOnline ? 'bg-green-500' : 'bg-red-500';
  const label = isOnline ? t('network.online') : t('network.offline');

  return (
    <div className={`fixed top-7 left-20 px-2 py-1 rounded text-white text-sm ${color}`}>
      {label}
    </div>
  );
};

export default NetworkStatusBadge;
