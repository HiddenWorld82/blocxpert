import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { properties, currentUser } = useAuth();
  const navigation = useNavigation();

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec salutation */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bonjour, {currentUser?.displayName || 'Investisseur'} !
        </Text>
        <Text style={styles.subtitle}>
          Voici un aperçu de votre portefeuille
        </Text>
      </View>

      {/* Stats rapides */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="business" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{properties.length}</Text>
          <Text style={styles.statLabel}>Immeubles</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#16a34a" />
          <Text style={styles.statNumber}>
            {properties.reduce((sum, p) => sum + (p.numberOfUnits || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Unités</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#dc2626" />
          <Text style={styles.statNumber}>
            {formatMoney(
              properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0)
            )}
          </Text>
          <Text style={styles.statLabel}>Valeur</Text>
        </View>
      </View>

      {/* Bouton d'action principal */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('PropertyForm' as never)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Analyser un nouveau bien</Text>
      </TouchableOpacity>

      {/* Liste des propriétés récentes */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Analyses récentes</Text>
        {properties.slice(0, 3).map((property) => (
          <TouchableOpacity key={property.id} style={styles.propertyCard}>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyAddress}>
                {property.address || 'Adresse non définie'}
              </Text>
              <Text style={styles.propertyDetails}>
                {property.numberOfUnits} unités • {formatMoney(property.purchasePrice)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  propertyDetails: {
    fontSize: 14,
    color: '#64748b',
  },
});