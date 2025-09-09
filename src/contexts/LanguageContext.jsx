import React, { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    'network.online': 'Online',
    'network.offline': 'Offline',
    'auth.login.title': 'Login',
    'auth.login.error': 'Failed to log in',
    'auth.google.error': 'Unable to log in with Google',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login.submit': 'Log In',
    'auth.google': 'Continue with Google',
    'auth.forgotPassword': 'Forgot password?',
    'auth.createAccount': 'Create an account',
    'auth.signup.title': 'Sign Up',
    'auth.signup.error': 'Unable to create account',
    'auth.signup.submit': 'Sign Up',
    'auth.haveAccount': 'Already have an account?',
    'auth.login.link': 'Log In',
    'auth.reset.title': 'Reset Password',
    'auth.reset.success': 'Check your email for further instructions.',
    'auth.reset.error': 'Failed to reset password',
    'auth.reset.submit': 'Reset',
    'auth.backToLogin': 'Back to login',
    'auth.logout': 'Log out'
  },
  fr: {
    'network.online': 'En ligne',
    'network.offline': 'Hors ligne',
    'auth.login.title': 'Connexion',
    'auth.login.error': 'Impossible de se connecter',
    'auth.google.error': 'Impossible de se connecter avec Google',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.login.submit': 'Se connecter',
    'auth.google': 'Continuer avec Google',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.createAccount': 'Créer un compte',
    'auth.signup.title': 'Inscription',
    'auth.signup.error': 'Impossible de créer le compte',
    'auth.signup.submit': "S'inscrire",
    'auth.haveAccount': 'Déjà un compte?',
    'auth.login.link': 'Se connecter',
    'auth.reset.title': 'Réinitialiser le mot de passe',
    'auth.reset.success': 'Vérifiez vos courriels pour continuer.',
    'auth.reset.error': 'Impossible de réinitialiser le mot de passe',
    'auth.reset.submit': 'Réinitialiser',
    'auth.backToLogin': 'Retour à la connexion',
    'auth.logout': 'Déconnexion'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage || 'en';
    setLanguage(userLang.startsWith('fr') ? 'fr' : 'en');
  }, []);

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

