import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ResetPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      Alert.alert(t('auth.reset.title'), t('auth.reset.success'));
      navigation.goBack();
    } catch (error) {
      console.error('Reset error', error);
      Alert.alert(t('auth.reset.title'), t('auth.reset.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBanner />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <LanguageSwitcher />
          <View style={styles.card}>
            <Text style={styles.title}>{t('auth.reset.title')}</Text>
            <TextInput
              placeholder={t('auth.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <Pressable style={styles.primaryButton} onPress={handleReset} disabled={submitting}>
              <Text style={styles.primaryButtonText}>
                {submitting ? `${t('auth.reset.submit')}...` : t('auth.reset.submit')}
              </Text>
            </Pressable>
          </View>
          <View style={styles.footer}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>{t('auth.backToLogin')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  flex: {
    flex: 1
  },
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb'
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  footer: {
    marginTop: 32,
    alignItems: 'center'
  },
  footerLink: {
    color: '#1d4ed8',
    fontWeight: '600'
  }
});

export default ResetPasswordScreen;
