// components/HomeScreen.jsx
import React from 'react';
import { Calculator, Plus, Home, TrendingUp, FileText } from 'lucide-react';

const HomeScreen = ({ properties, onNew, onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <Home className="inline-block mr-3 text-blue-600" />
            Analyseur de Rentabilité Immobilière
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre assistant intelligent pour réussir vos investissements immobiliers
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">🚀 Commencez votre première analyse</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Saisissez vos données</h3>
                <p className="text-gray-600 text-sm">
                  Prix, revenus, dépenses - nous vous guidons à chaque étape
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Obtenez l'analyse</h3>
                <p className="text-gray-600 text-sm">
                  Rentabilité, cash flow, recommandations personnalisées
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Générez le rapport</h3>
                <p className="text-gray-600 text-sm">
                  Rapport professionnel prêt à présenter
                </p>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={onNew}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="inline-block mr-2" />
                Analyser mon premier immeuble
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Mes Analyses</h2>
              <button
                onClick={onNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="inline-block mr-1" />
                Nouvelle analyse
              </button>
            </div>
            <div className="grid gap-4">
              {properties.map((property, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelect(property)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {property.address || 'Adresse non spécifiée'}
                      </h3>
                      <p className="text-gray-600">
                        {property.numberOfUnits} unités •
                        {Number(property.purchasePrice).toLocaleString('fr-CA')}$ •
                        {(property.purchasePrice / property.numberOfUnits).toLocaleString('fr-CA')}$/porte
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${property.effectiveNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {property.effectiveNetIncome >= 0 ? '+' : ''}{Math.round(property.effectiveNetIncome).toLocaleString('fr-CA')}$ /an
                      </div>
                      <div className="text-sm text-gray-500">
                        Rendement après 1 an: {property.totalReturn?.toFixed(1) || 'N/A'}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
