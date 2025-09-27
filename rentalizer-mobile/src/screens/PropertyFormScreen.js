import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import defaultProperty from '../defaults/defaultProperty';
import useRentabilityCalculator from '../hooks/useRentabilityCalculator';
import { saveProperty, updateProperty } from '../services/dataService';

const lockedFields = {
  debtCoverage: true,
  welcomeTax: true
};

const fieldGroups = (t) => ([
  {
    title: t('property.form.section.basic'),
    fields: [
      { key: 'address', type: 'text' },
      { key: 'city', type: 'text' },
      { key: 'province', type: 'text', autoCapitalize: 'characters' },
      { key: 'postalCode', type: 'text', autoCapitalize: 'characters' },
      { key: 'purchasePrice', type: 'number' },
      { key: 'askingPrice', type: 'number' },
      { key: 'numberOfUnits', type: 'number' }
    ]
  },
  {
    title: t('property.form.section.revenue'),
    fields: [
      { key: 'annualRent', type: 'number' },
      { key: 'parkingRevenue', type: 'number' },
      { key: 'internetRevenue', type: 'number' },
      { key: 'storageRevenue', type: 'number' },
      { key: 'otherRevenue', type: 'number' }
    ]
  },
  {
    title: t('property.form.section.expenses'),
    fields: [
      { key: 'vacancyRate', type: 'number' },
      { key: 'municipalTaxes', type: 'number' },
      { key: 'schoolTaxes', type: 'number' },
      { key: 'insurance', type: 'number' },
      { key: 'electricityHeating', type: 'number' },
      { key: 'maintenance', type: 'number' },
      { key: 'concierge', type: 'number' },
      { key: 'managementRate', type: 'number' },
      { key: 'otherExpenses', type: 'number' },
      { key: 'welcomeTax', type: 'number', editable: false }
    ]
  },
  {
    title: t('property.form.section.financing'),
    fields: [
      { key: 'financingType', type: 'text' },
      { key: 'debtCoverageRatio', type: 'number', editable: !lockedFields.debtCoverage },
      { key: 'qualificationRate', type: 'number' },
      { key: 'mortgageRate', type: 'number' },
      { key: 'amortization', type: 'number' },
      { key: 'term', type: 'number' }
    ]
  }
]);

const PropertyFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { property: initialProperty, isNew } = route.params || {};
  const [currentProperty, setCurrentProperty] = useState({
    ...(defaultProperty || {}),
    ...(initialProperty || {})
  });
  const [advancedExpenses, setAdvancedExpenses] = useState(
    Boolean(initialProperty?.advancedExpenses)
  );
  const [saving, setSaving] = useState(false);

  const analysis = useRentabilityCalculator(
    currentProperty,
    advancedExpenses,
    lockedFields,
    setCurrentProperty
  );

  const groups = useMemo(() => fieldGroups(t), [t]);

  const handleChange = (key, value) => {
    setCurrentProperty((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Rentalyzer', t('errors.generic'));
      return;
    }

    setSaving(true);
    try {
      const fieldsToSave = [
        'address',
        'city',
        'province',
        'postalCode',
        'askingPrice',
        'purchasePrice',
        'municipalEvaluation',
        'numberOfUnits',
        'structureType',
        'annualRent',
        'parkingRevenue',
        'internetRevenue',
        'storageRevenue',
        'otherRevenue',
        'vacancyRate',
        'insurance',
        'municipalTaxes',
        'schoolTaxes',
        'electricityHeating',
        'heating',
        'electricity',
        'maintenance',
        'managementRate',
        'concierge',
        'landscaping',
        'snowRemoval',
        'extermination',
        'fireInspection',
        'advertising',
        'legal',
        'accounting',
        'elevator',
        'cableInternet',
        'appliances',
        'garbage',
        'washerDryer',
        'hotWater',
        'operatingExpenses',
        'otherExpenses',
        'structureType',
        'numFridges',
        'numStoves',
        'numDishwashers',
        'numWashers',
        'numDryers',
        'numHeatPumps',
        'numElevators',
        'cmhcAnalysis',
        'cmhcTax',
        'welcomeTax',
        'financingType',
        'aphPoints',
        'debtCoverageRatio',
        'qualificationRate',
        'mortgageRate',
        'amortization',
        'term',
        'inspection',
        'environmental1',
        'environmental2',
        'environmental3',
        'otherTests',
        'appraiser',
        'expertises',
        'notary',
        'renovations',
        'appreciationRate',
        'rentIncreaseRate',
        'expenseIncreaseRate'
      ];

      const baseProperty = { structureType: 'woodFrame', ...currentProperty };
      const propertyData = fieldsToSave.reduce((acc, key) => {
        const value = baseProperty[key];
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const propertyWithAnalysis = {
        ...propertyData,
        ...analysis,
        advancedExpenses,
        uid: currentUser.uid
      };

      const cleanProperty = Object.fromEntries(
        Object.entries(propertyWithAnalysis).filter(([, value]) => value !== undefined)
      );

      let propertyId = currentProperty.id;
      if (propertyId) {
        await updateProperty(propertyId, cleanProperty);
      } else {
        propertyId = await saveProperty(cleanProperty);
      }

      const updatedProperty = { ...currentProperty, ...cleanProperty, id: propertyId };
      setCurrentProperty(updatedProperty);
      navigation.replace('PropertyDetails', {
        propertyId,
        property: updatedProperty
      });
    } catch (error) {
      console.error('Save property error', error);
      Alert.alert(t('save'), t('errors.generic'));
    } finally {
      setSaving(false);
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
          <Text style={styles.title}>{t('property.form.title')}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {advancedExpenses
                ? t('property.form.advancedMode')
                : t('property.form.simpleMode')}
            </Text>
            <Switch
              value={advancedExpenses}
              onValueChange={setAdvancedExpenses}
            />
          </View>
          {groups.map((group) => (
            <View key={group.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{group.title}</Text>
              {group.fields.map((field) => (
                <View key={field.key} style={styles.inputGroup}>
                  <Text style={styles.label}>{t(`property.fields.${field.key}`)}</Text>
                  <TextInput
                    style={[styles.input, field.editable === false && styles.inputDisabled]}
                    value={currentProperty[field.key]?.toString() ?? ''}
                    editable={field.editable !== false}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    autoCapitalize={field.autoCapitalize || 'none'}
                    onChangeText={(value) => handleChange(field.key, value)}
                  />
                </View>
              ))}
            </View>
          ))}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('property.details.title')}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('property.details.capRate')}</Text>
              <Text style={styles.summaryValue}>
                {analysis.capRate ? `${analysis.capRate.toFixed(2)}%` : '—'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('property.details.cashflow')}</Text>
              <Text style={styles.summaryValue}>
                {analysis.cashFlow ? `$${Math.round(analysis.cashFlow).toLocaleString()}` : '—'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('property.details.coc')}</Text>
              <Text style={styles.summaryValue}>
                {analysis.cashOnCash ? `${analysis.cashOnCash.toFixed(2)}%` : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (pressed || saving) && styles.saveButtonPressed,
                saving && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving
                  ? t('property.form.update')
                  : isNew
                  ? t('property.form.save')
                  : t('property.form.update')}
              </Text>
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
    backgroundColor: '#f8fafc'
  },
  flex: {
    flex: 1
  },
  container: {
    padding: 24
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 12
  },
  label: {
    color: '#475569',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc'
  },
  inputDisabled: {
    backgroundColor: '#e2e8f0',
    color: '#64748b'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  summaryLabel: {
    color: '#475569',
    fontWeight: '500'
  },
  summaryValue: {
    color: '#0f172a',
    fontWeight: '700'
  },
  buttonRow: {
    alignItems: 'center',
    marginBottom: 48
  },
  saveButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden'
  },
  saveButtonPressed: {
    opacity: 0.8
  },
  saveButtonDisabled: {
    backgroundColor: '#1e40af'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default PropertyFormScreen;
