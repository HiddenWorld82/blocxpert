// components/HomeScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  Calculator,
  Plus,
  Home,
  TrendingUp,
  FileText,
  Eye,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getScenarios } from '../services/scenarioService';
import { deleteBuilding } from '../services/buildingService';

const HomeScreen = ({ buildings, onNew, onNewScenario }) => {
  const navigate = useNavigate();
  const [criterion, setCriterion] = useState('totalReturn');
  const [scenariosByBuilding, setScenariosByBuilding] = useState({});

  useEffect(() => {
    const unsubscribes = buildings.map((b) =>
      getScenarios(b.id, (scs) => {
        setScenariosByBuilding((prev) => ({ ...prev, [b.id]: scs }));
      })
    );
    return () => unsubscribes.forEach((u) => u && u());
  }, [buildings]);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet immeuble ?')) {
      await deleteBuilding(id);
    }
  };

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

        {buildings.length === 0 ? (
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
              <h2 className="text-2xl font-semibold">Mes Immeubles</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm">
                  <label className="mr-2">Critère</label>
                  <select
                    value={criterion}
                    onChange={(e) => setCriterion(e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="totalReturn">Rendement total</option>
                    <option value="effectiveNetIncome">ENI</option>
                  </select>
                </div>
                <button
                  onClick={onNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="inline-block mr-1" />
                  Nouvelle analyse
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {buildings.map((b) => {
                const scs = scenariosByBuilding[b.id] || [];
                const count = scs.length;
                const best = scs.reduce((best, s) => {
                  const val = Number(s[criterion] || 0);
                  const bestVal = best ? Number(best[criterion] || 0) : -Infinity;
                  return val > bestVal ? s : best;
                }, null);
                const last = scs.reduce((latest, s) => {
                  const d = s.updatedAt || s.createdAt;
                  if (!d) return latest;
                  const dDate = d.toDate ? d.toDate() : new Date(d);
                  const lDate = latest ? (latest.toDate ? latest.toDate() : new Date(latest)) : null;
                  return !lDate || dDate > lDate ? d : latest;
                }, b.updatedAt);
                const formatDate = (ts) => {
                  if (!ts) return 'N/A';
                  const date = ts.toDate ? ts.toDate() : new Date(ts);
                  return date.toLocaleDateString('fr-CA');
                };
                return (
                  <div key={b.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">
                        {b.address || 'Adresse non spécifiée'}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 flex items-center text-sm"
                          onClick={() => navigate(`/buildings/${b.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Voir
                        </button>
                        <button
                          className="text-green-600 flex items-center text-sm"
                          onClick={() => onNewScenario(b)}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Nouveau scénario
                        </button>
                        <button
                          className="text-red-600 flex items-center text-sm"
                          onClick={() => handleDelete(b.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Scénarios : {count}</div>
                      <div>
                        Meilleur ({criterion}) :{' '}
                        {best ? best.name || best.type || 'Scénario' : 'N/A'}
                      </div>
                      <div>Dernière modification : {formatDate(last)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
