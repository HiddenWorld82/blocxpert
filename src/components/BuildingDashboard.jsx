// components/BuildingDashboard.jsx
import React from 'react';

const BuildingDashboard = ({ property, onCreateScenario }) => {
  const pricePerDoor = property.numberOfUnits
    ? (property.purchasePrice / property.numberOfUnits).toLocaleString('fr-CA')
    : 'N/A';
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Tableau de bord de l'immeuble</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">
              {property.address || 'Adresse non spécifiée'}
            </h3>
            <p className="text-gray-600">
              {property.numberOfUnits} unités •{' '}
              {Number(property.purchasePrice).toLocaleString('fr-CA')}$ •{' '}
              {pricePerDoor}$/porte
            </p>
          </div>
          <button
            onClick={onCreateScenario}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Créer un scénario
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingDashboard;
