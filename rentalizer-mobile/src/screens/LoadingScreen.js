import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default LoadingScreen;
