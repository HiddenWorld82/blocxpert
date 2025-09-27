// src/screens/PropertyFormScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface PropertyForm {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  purchasePrice: string;
  numberOfUnits: string;
  annualRent: string;
  municipalTaxes: string;
  schoolTaxes: string;
  insurance: string;
  maintenance: string;
  managementRate: string;
  electricityHeating: string;
}

export default function PropertyFormScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState<PropertyForm>({
    address: '',
    city: '',
    province: 'QC',
    postalCode: '',
    purchasePrice: '',
    numberOfUnits: '',
    annualRent: '',
    municipalTaxes: '',
    schoolTaxes: '',
    insurance: '',
    maintenance: '610',
    managementRate: '5',
    electricityHeating: '',
  });

  const updateField = (field: keyof PropertyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const required = ['address', 'city', 'province', 'postalCode', 'purchasePrice', 'numberOfUnits', 'annualRent'];
    
    for (const field of required) {
      if (!form[field as keyof PropertyForm]) {
        Alert.alert('Erreur', `Le champ ${field} est requis`);
        return false;
      }
    }
    
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    // TODO: Sauvegarder la propriété
    Alert.alert('Succès', 'Propriété sauvegardée', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const formatCurrency = (value: string): string => {
    const number = value.replace(/[^\d]/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('fr-CA').format(parseInt(number));
  };

  const handleCurrencyChange = (field: keyof PropertyForm, value: string) => {
    const formatted = formatCurrency(value);
    updateField(field, formatted);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle Analyse</Text>
        </View>

        {/* Informations de base */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Informations de base</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse *</Text>
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="123 Rue Example"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Ville *</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(value) => updateField('city', value)}
                placeholder="Montréal"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Province *</Text>
              <TextInput
                style={styles.input}
                value={form.province}
                onChangeText={(value) => updateField('province', value)}
                placeholder="QC"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code postal *</Text>
            <TextInput
              style={[styles.input, styles.halfWidth]}
              value={form.postalCode}
              onChangeText={(value) => updateField('postalCode', value)}
              placeholder="H2B 1A0"
              autoCapitalize="characters"
              maxLength={7}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Prix d'achat *</Text>
              <TextInput
                style={styles.input}
                value={form.purchasePrice}
                onChangeText={(value) => handleCurrencyChange('purchasePrice', value)}
                placeholder="450 000"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Nombre d'unités *</Text>
              <TextInput
                style={styles.input}
                value={form.numberOfUnits}
                onChangeText={(value) => updateField('numberOfUnits', value)}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Revenus */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Revenus annuels</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loyers annuels *</Text>
            <TextInput
              style={styles.input}
              value={form.annualRent}
              onChangeText={(value) => handleCurrencyChange('annualRent', value)}
              placeholder="36 000"
              keyboardType="numeric"
            />
          </View>
        </Card>

        {/* Dépenses */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Dépenses d'exploitation</Text>
          
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Taxes municipales</Text>
              <TextInput
                style={styles.input}
                value={form.municipalTaxes}
                onChangeText={(value) => handleCurrencyChange('municipalTaxes', value)}
                placeholder="3 500"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Taxes scolaires</Text>
              <TextInput
                style={styles.input}
                value={form.schoolTaxes}
                onChangeText={(value) => handleCurrencyChange('schoolTaxes', value)}
                placeholder="1 200"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Assurance</Text>
              <TextInput
                style={styles.input}
                value={form.insurance}
                onChangeText={(value) => handleCurrencyChange('insurance', value)}
                placeholder="1 500"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Électricité/Chauffage</Text>
              <TextInput
                style={styles.input}
                value={form.electricityHeating}
                onChangeText={(value) => handleCurrencyChange('electricityHeating', value)}
                placeholder="2 000"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Entretien (par unité)</Text>
              <TextInput
                style={styles.input}
                value={form.maintenance}
                onChangeText={(value) => updateField('maintenance', value)}
                placeholder="610"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Gestion (%)</Text>
              <TextInput
                style={styles.input}
                value={form.managementRate}
                onChangeText={(value) => updateField('managementRate', value)}
                placeholder="5"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <Button
            title="Annuler"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Sauvegarder"
            onPress={handleSave}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  halfWidth: {
    width: '50%',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
});