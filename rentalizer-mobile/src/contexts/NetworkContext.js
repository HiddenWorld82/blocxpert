import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({ online: true });

export const NetworkProvider = ({ children }) => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateState = (state) => {
      const isOnline = Boolean(state.isConnected) && state.isInternetReachable !== false;
      setOnline(isOnline);
    };

    const subscription = NetInfo.addEventListener(updateState);
    NetInfo.fetch().then(updateState).catch(() => setOnline(false));

    return () => {
      subscription?.();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ online }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
