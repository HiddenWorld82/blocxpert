import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import defaultProperty from '../defaults/defaultProperty';
import useRentabilityCalculator from '../hooks/useRentabilityCalculator';

const lockedFields = {
  debtCoverage: true,
  welcomeTax: true
};

const PropertyDetailsScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { properties } = useAuth();
  const { propertyId, property: routeProperty } = route.params || {};

  const propertyFromList = useMemo(
    () => properties.find((item) => item.id === propertyId),
    [properties, propertyId]
  );

  const [currentProperty, setCurrentProperty] = useState({
    ...(defaultProperty || {}),
    ...(routeProperty || propertyFromList || {})
  });

  const analysis = useRentabilityCalculator(
    currentProperty,
    Boolean(currentProperty.advancedExpenses),
    lockedFields,
    setCurrentProperty
  );

  const metrics = [
    { label: t('property.details.revenue'), value: analysis.totalGrossRevenue },
    { label: t('property.details.expenses'), value: analysis.totalExpenses },
    { label: t('property.details.noi'), value: analysis.netOperatingIncome },
    { label: t('property.details.capRate'), value: analysis.capRate, suffix: '%' },
    { label: t('property.details.cashflow'), value: analysis.cashFlow },
    { label: t('property.details.coc'), value: analysis.cashOnCash, suffix: '%' },
    { label: t('property.details.debtService'), value: analysis.debtService },
    { label: t('property.details.downPayment'), value: analysis.downPayment },
    { label: t('property.details.ltv'), value: analysis.ltv, suffix: '%' }
  ];

  const formatValue = (value, suffix) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return '—';
    }
    if (suffix === '%') {
      return `${Number(value).toFixed(2)}%`;
    }
    return `$${Math.round(Number(value)).toLocaleString()}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBanner />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{currentProperty.address || t('home.address.unset')}</Text>
            <Text style={styles.subtitle}>{currentProperty.city}</Text>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => navigation.navigate('PropertyForm', { property: currentProperty, isNew: false })}
          >
            <Text style={styles.editText}>{t('edit')}</Text>
          </Pressable>
        </View>
        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{formatValue(metric.value, metric.suffix)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('property.details.generateReport')}</Text>
          {(analysis.futureReturns || []).map((item) => (
            <View key={item.year} style={styles.futureRow}>
              <Text style={styles.futureYear}>
                {item.year} {t('property.details.years')}
              </Text>
              <View style={styles.futureValues}>
                <Text style={styles.futureValue}>{formatValue(item.futureValue)}</Text>
                <Text style={styles.futureValue}>{formatValue(item.futureCashFlow)}</Text>
                <Text style={styles.futureValue}>{formatValue(item.totalGain)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569',
    marginTop: 4
  },
  editButton: {
    backgroundColor: '#e0f2fe',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  editText: {
    color: '#0369a1',
    fontWeight: '600'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  metricLabel: {
    color: '#475569',
    marginBottom: 8,
    fontWeight: '500'
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700'
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  futureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  futureYear: {
    fontWeight: '600',
    color: '#0f172a'
  },
  futureValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%'
  },
  futureValue: {
    color: '#475569',
    fontWeight: '500'
  }
});

export default PropertyDetailsScreen;
