// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PropertyFormScreen from '../screens/PropertyFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navigation principale avec onglets
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Accueil') {
            iconName = 'home';
          } else if (route.name === 'Immeubles') {
            iconName = 'business';
          } else if (route.name === 'Analyses') {
            iconName = 'analytics';
          } else if (route.name === 'Paramètres') {
            iconName = 'settings';
          } else {
            iconName = 'help';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Immeubles" 
        component={PropertiesScreen}
        options={{ title: 'Mes Immeubles' }}
      />
      <Tab.Screen 
        name="Analyses" 
        component={AnalysisScreen}
        options={{ title: 'Analyses' }}
      />
      <Tab.Screen 
        name="Paramètres" 
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
    </Tab.Navigator>
  );
}

// Navigation avec authentification
export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null; // Ou un écran de chargement
  }

  return (
    <Stack.Navigator>
      {currentUser ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PropertyForm" 
            component={PropertyFormScreen}
            options={{ 
              title: 'Nouveau Bien',
              presentation: 'modal'
            }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}