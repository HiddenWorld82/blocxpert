import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { useLanguage } from '../contexts/LanguageContext';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { t } = useLanguage();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: t('auth.login.title') }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: t('auth.signup.title') }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: t('auth.reset.title') }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
