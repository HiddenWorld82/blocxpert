import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NetworkStatusBanner from '../components/NetworkStatusBanner';

const SettingsScreen = () => {
  const { logout, currentUser } = useAuth();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBanner />
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <LanguageSwitcher />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.detail}>{currentUser?.email}</Text>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  detail: {
    color: '#475569',
    marginBottom: 12
  },
  logoutButton: {
    paddingVertical: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutText: {
    color: '#b91c1c',
    fontWeight: '600'
  }
});

export default SettingsScreen;
