import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '',
  revenue: '',
  expenses: '',
  balance: '',
  dueDate: '',
  term: '',
  rate: '',
};

const PropertyPortfolio = () => {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('propertyPortfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem('propertyPortfolio', JSON.stringify(properties));
  }, [properties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addProperty = () => {
    if (!form.name) return;
    setProperties((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        revenue: Number(form.revenue) || 0,
        expenses: Number(form.expenses) || 0,
        balance: Number(form.balance) || 0,
        dueDate: form.dueDate,
        term: Number(form.term) || 0,
        rate: Number(form.rate) || 0,
      },
    ]);
    setForm(emptyForm);
  };

  const removeProperty = (id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Mon Parc Immobilier</h2>
      <div className="grid md:grid-cols-7 gap-2 mb-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Adresse ou nom"
          className="border rounded p-2"
        />
        <input
          type="number"
          name="revenue"
          value={form.revenue}
          onChange={handleChange}
          placeholder="Revenus annuels"
          className="border rounded p-2"
        />
        <input
          type="number"
          name="expenses"
          value={form.expenses}
          onChange={handleChange}
          placeholder="Dépenses annuelles"
          className="border rounded p-2"
        />
        <input
          type="number"
          name="balance"
          value={form.balance}
          onChange={handleChange}
          placeholder="Solde prêt"
          className="border rounded p-2"
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="number"
          name="term"
          value={form.term}
          onChange={handleChange}
          placeholder="Terme (ans)"
          className="border rounded p-2"
        />
        <input
          type="number"
          step="0.01"
          name="rate"
          value={form.rate}
          onChange={handleChange}
          placeholder="Taux %"
          className="border rounded p-2"
        />
      </div>
      <button
        onClick={addProperty}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700 transition-colors"
      >
        <Plus className="inline-block mr-1" /> Ajouter
      </button>
      {properties.length > 0 && (
        <ul className="space-y-4">
          {properties.map((p) => (
            <li
              key={p.id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-600">
                  Revenus: {p.revenue.toLocaleString('fr-CA')} $ • Dépenses: {p.expenses.toLocaleString('fr-CA')} $ • Solde: {p.balance.toLocaleString('fr-CA')} $
                  <br />Échéance: {p.dueDate || 'N/A'} • Terme: {p.term} ans • Taux: {p.rate}%
                </p>
              </div>
              <button
                onClick={() => removeProperty(p.id)}
                className="text-red-600 hover:text-red-800"
                aria-label="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PropertyPortfolio;

