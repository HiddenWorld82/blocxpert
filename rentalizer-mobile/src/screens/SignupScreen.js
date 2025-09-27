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

const SignupScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert(t('auth.signup.title'), 'Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(email.trim(), password);
    } catch (error) {
      console.error('Signup error', error);
      Alert.alert(t('auth.signup.title'), t('errors.generic'));
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
            <Text style={styles.title}>{t('auth.signup.title')}</Text>
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
            <TextInput
              placeholder={t('auth.password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <Pressable style={styles.primaryButton} onPress={handleSignup} disabled={submitting}>
              <Text style={styles.primaryButtonText}>
                {submitting ? `${t('auth.signup.submit')}...` : t('auth.signup.submit')}
              </Text>
            </Pressable>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
            <Pressable onPress={() => navigation.replace('Login')}>
              <Text style={styles.footerLink}>{t('auth.login.link')}</Text>
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
    backgroundColor: '#16a34a',
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
  footerText: {
    color: '#4b5563'
  },
  footerLink: {
    color: '#1d4ed8',
    fontWeight: '600',
    marginTop: 4
  }
});

export default SignupScreen;
