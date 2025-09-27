import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Share
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import defaultProperty from '../defaults/defaultProperty';
import { deleteProperty, exportProperty } from '../services/dataService';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HomeScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { properties, propertiesLoading, logout, currentUser } = useAuth();

  const handleCreate = () => {
    navigation.navigate('PropertyForm', {
      property: { ...defaultProperty },
      isNew: true
    });
  };

  const handleOpen = (property) => {
    navigation.navigate('PropertyDetails', {
      propertyId: property.id,
      property
    });
  };

  const handleEdit = (property) => {
    navigation.navigate('PropertyForm', {
      property,
      isNew: false
    });
  };

  const handleDelete = async (property) => {
    Alert.alert(t('delete'), t('property.form.delete.confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProperty(property.id);
          } catch (error) {
            console.error('Delete error', error);
            Alert.alert(t('delete'), t('errors.generic'));
          }
        }
      }
    ]);
  };

  const handleShare = async (property) => {
    try {
      const exported = await exportProperty(property.id);
      if (!exported) {
        return;
      }
      const message = `${t('home.title')}\n${property.address || t('home.address.unset')}\n${t(
        'property.details.revenue'
      )}: ${exported.property.totalGrossRevenue || property.annualRent}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Share error', error);
      Alert.alert(t('home.share'), t('share.error'));
    }
  };

  const renderProperty = ({ item }) => (
    <Pressable style={styles.card} onPress={() => handleOpen(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.address || t('home.address.unset')}</Text>
        <Text style={styles.cardSub}>{item.city}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>{t('edit')}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => handleShare(item)}>
          <Text style={styles.actionText}>{t('home.share')}</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>{t('home.delete')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <NetworkStatusBanner />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>{currentUser?.email}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </Pressable>
      </View>
      <LanguageSwitcher />
      <View style={styles.container}>
        <Pressable style={styles.newButton} onPress={handleCreate}>
          <Text style={styles.newButtonText}>{t('home.new.button')}</Text>
        </Pressable>
        {propertiesLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : properties.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('home.empty.title')}</Text>
            <Text style={styles.emptyDescription}>{t('home.empty.description')}</Text>
          </View>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id}
            renderItem={renderProperty}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569',
    marginTop: 4
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600'
  },
  container: {
    flex: 1,
    paddingHorizontal: 24
  },
  newButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  loader: {
    marginTop: 24
  },
  emptyState: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  emptyDescription: {
    color: '#475569',
    textAlign: 'center'
  },
  list: {
    paddingBottom: 24
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardHeader: {
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardSub: {
    color: '#475569',
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0f2fe'
  },
  actionText: {
    color: '#0369a1',
    fontWeight: '600'
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2'
  },
  deleteText: {
    color: '#b91c1c',
    fontWeight: '600'
  }
});

export default HomeScreen;
