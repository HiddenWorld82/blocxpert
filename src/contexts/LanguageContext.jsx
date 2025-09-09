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
    'auth.logout': 'Log out',
    'about.back': 'Back',
    'about.tagline': 'Actuary by training, entrepreneur and real estate investor',
    'about.intro': 'Passionate about financial analysis and real estate, I developed Rentalyzer to provide investors with a simple and reliable tool to validate the actual returns of their projects.',
    'about.mvvTitle': 'Application mission, vision, and values',
    'about.mvv1': 'Rentalyzer was born from the desire to democratize real estate profitability analysis and help investors make informed decisions.',
    'about.mvv2': 'In the long term, the goal is to support investors in understanding their investments and validating the actual returns they generate.',
    'about.valuesLabel': 'Values',
    'about.valuesList': 'Simplicity, Reliability, Ethics',
    'about.backgroundTitle': 'Professional background',
    'about.education': "Holder of a bachelor's degree in actuarial science",
    'about.entrepreneur': 'Entrepreneur since the age of 20',
    'about.investor': 'Experienced real estate investor',
    'about.lender': 'Private lender (through Omega Capital Privé and Société de Crédit Immo Québec)',
    'about.contactTitle': 'Contact',
    'about.email': 'Email',
    'about.phone': 'Phone',
    'about.linkedin': 'LinkedIn',
    'about.photoAlt': 'Developer photo'
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
    'auth.logout': 'Déconnexion',
    'about.back': 'Retour',
    'about.tagline': 'Actuaire de formation, entrepreneur et investisseur immobilier',
    'about.intro': "Passionné par l'analyse financière et l'immobilier, j'ai développé Rentalyzer pour offrir aux investisseurs un outil simple et fiable afin de valider les rendements réels de leurs projets.",
    'about.mvvTitle': "Mission, vision et valeurs de l'application",
    'about.mvv1': "Rentalyzer est né du désir de démocratiser l'analyse de rentabilité immobilière et d'aider les investisseurs à prendre des décisions éclairées.",
    'about.mvv2': "À long terme, l'objectif est d'accompagner les investisseurs pour comprendre leurs placements et valider les rendements réels qu'ils génèrent.",
    'about.valuesLabel': 'Valeurs',
    'about.valuesList': 'Simplicité, Fiabilité, Éthique',
    'about.backgroundTitle': 'Parcours professionnel',
    'about.education': "Détenteur d'un baccalauréat en actuariat",
    'about.entrepreneur': "Entrepreneur depuis l'âge de 20 ans",
    'about.investor': "Investisseur immobilier d'expérience",
    'about.lender': 'Prêteur privé (via Omega Capital Privé et Société de Crédit Immo Québec)',
    'about.contactTitle': 'Contact',
    'about.email': 'Courriel',
    'about.phone': 'Téléphone',
    'about.linkedin': 'LinkedIn',
    'about.photoAlt': 'Photo du développeur'
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

