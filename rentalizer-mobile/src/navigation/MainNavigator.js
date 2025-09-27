import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PropertyFormScreen from '../screens/PropertyFormScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useLanguage } from '../contexts/LanguageContext';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const { t } = useLanguage();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('home.title') }}
      />
      <Stack.Screen
        name="PropertyForm"
        component={PropertyFormScreen}
        options={{ title: t('property.form.title') }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{ title: t('property.details.title') }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
