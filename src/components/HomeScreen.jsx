// components/HomeScreen.jsx
import React from 'react';
import {
  Calculator,
  Plus,
  Home,
  TrendingUp,
  FileText,
  Trash2,
  Share2,
  DollarSign,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const HomeScreen = ({ properties, onNew, onSelect, onDelete, onShare, onAbout }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <img
              src="/rentalyzer-logo.png"
              alt="Rentalyzer logo"
              width={200}
              className="inline-block"
            />
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.subtitle')}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">{t('home.empty.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('home.step1.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('home.step1.text')}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('home.step2.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('home.step2.text')}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('home.step3.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('home.step3.text')}
                </p>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={onNew}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="inline-block mr-2" />
                {t('home.new.button')}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col items-center mb-6 md:flex-row md:justify-between md:items-center">
              <h2 className="text-2xl font-semibold mb-4 md:mb-0">{t('home.existing.title')}</h2>
              <button
                onClick={onNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="inline-block mr-1" />
                {t('home.existing.new')}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {properties.map((property, index) => {
                const fullAddress = [
                  property.address,
                  property.city,
                  property.province,
                  property.postalCode,
                ]
                  .filter(Boolean)
                  .join(', ');
                return (
                  <div
                    key={index}
                    className="relative border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelect(property)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare?.(property.id);
                      }}
                      className="absolute top-2 right-10 text-blue-600 hover:text-blue-800"
                      aria-label={t('home.share')}
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(property.id);
                      }}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      aria-label={t('home.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                    <h3 className="font-semibold text-lg mb-3">
                      {fullAddress || t('home.address.unset')}
                    </h3>
                    <div className="flex flex-wrap text-sm text-gray-600 gap-y-1 mb-2">
                      <div className="w-1/2 flex items-center">
                        <Home className="w-4 h-4 mr-1 text-blue-600" />
                        {property.numberOfUnits} {t('home.units')}
                      </div>
                      <div className="w-1/2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        {Number(property.purchasePrice).toLocaleString('fr-CA')}$
                      </div>
                      <div className="w-1/2 flex items-center">
                        <Calculator className="w-4 h-4 mr-1 text-purple-600" />
                        {(property.purchasePrice / property.numberOfUnits).toLocaleString('fr-CA')}{t('home.pricePerDoor')}
                      </div>
                    </div>
                    <div
                      className={`mt-2 inline-block px-2 py-1 text-sm font-medium rounded ${
                        property.effectiveNetIncome >= 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {property.effectiveNetIncome >= 0 ? '+' : ''}
                      {Math.round(property.effectiveNetIncome).toLocaleString('fr-CA')}${t('home.perYear')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-8">
          <button onClick={onAbout} className="hover:underline">
            {t('home.about')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;
