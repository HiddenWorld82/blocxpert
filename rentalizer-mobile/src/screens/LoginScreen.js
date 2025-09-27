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

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      console.error('Login error', error);
      Alert.alert(t('auth.login.title'), t('errors.generic'));
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
            <Text style={styles.title}>{t('auth.login.title')}</Text>
            <TextInput
              placeholder={t('auth.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <TextInput
              placeholder={t('auth.password')}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
              <Text style={styles.primaryButtonText}>
                {submitting ? `${t('auth.login.submit')}...` : t('auth.login.submit')}
              </Text>
            </Pressable>
            <Pressable
              style={styles.linkButton}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={styles.linkText}>{t('auth.forgotPassword')}</Text>
            </Pressable>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.createAccount')}</Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>{t('auth.signup.title')}</Text>
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
  linkButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#1d4ed8',
    fontWeight: '500'
  },
  footer: {
    marginTop: 32,
    alignItems: 'center'
  },
  footerText: {
    color: '#4b5563'
  },
  footerLink: {
    color: '#1d4ed8',
    fontWeight: '600',
    marginTop: 4
  }
});

export default LoginScreen;
