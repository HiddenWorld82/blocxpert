import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();

  return (
    <View style={styles.container}>
      {availableLanguages.map((code) => (
        <Pressable
          key={code}
          onPress={() => setLanguage(code)}
          style={[styles.button, language === code && styles.activeButton]}
        >
          <Text style={[styles.text, language === code && styles.activeText]}>
            {code.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4
  },
  activeButton: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937'
  },
  text: {
    color: '#1f2937',
    fontWeight: '600'
  },
  activeText: {
    color: '#fff'
  }
});

export default LanguageSwitcher;
