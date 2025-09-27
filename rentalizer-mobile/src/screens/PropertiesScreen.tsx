import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function PropertiesScreen() {
  const { properties } = useAuth();
  const navigation = useNavigation();

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const renderPropertyItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.propertyCard}>
      <View style={styles.propertyHeader}>
        <View style={styles.propertyIcon}>
          <Ionicons name="business" size={24} color="#2563eb" />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyAddress}>
            {item.address || 'Adresse non définie'}
          </Text>
          <Text style={styles.propertyCity}>
            {[item.city, item.province].filter(Boolean).join(', ')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>
      
      <View style={styles.propertyStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.numberOfUnits || 0}</Text>
          <Text style={styles.statLabel}>Unités</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatMoney(item.purchasePrice)}</Text>
          <Text style={styles.statLabel}>Prix</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {item.numberOfUnits ? formatMoney(item.purchasePrice / item.numberOfUnits) : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Prix/Porte</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business" size={80} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Aucun immeuble</Text>
        <Text style={styles.emptySubtitle}>
          Commencez par analyser votre premier investissement
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PropertyForm' as never)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Analyser un bien</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PropertyForm' as never)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  propertyCity: {
    fontSize: 14,
    color: '#6b7280',
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});