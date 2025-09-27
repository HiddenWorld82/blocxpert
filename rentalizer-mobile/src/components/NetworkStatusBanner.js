import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';
import { useLanguage } from '../contexts/LanguageContext';

const NetworkStatusBanner = () => {
  const { online } = useNetwork();
  const { t } = useLanguage();

  if (online) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('network.offline')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#b91c1c',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  }
});

export default NetworkStatusBanner;
