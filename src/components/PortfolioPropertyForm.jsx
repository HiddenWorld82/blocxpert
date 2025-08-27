import React, { useState } from 'react';

const emptyForm = {
  name: '',
  address: '',
  city: '',
  purchasePrice: '',
  annualRent: '',
  annualExpenses: '',
  mortgageBalance: '',
  dueDate: '',
  term: '',
  rate: '',
};

const PortfolioPropertyForm = ({ onSave, onCancel, initialData = emptyForm }) => {
  const [form, setForm] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSave({
      ...form,
      purchasePrice: Number(form.purchasePrice) || 0,
      annualRent: Number(form.annualRent) || 0,
      annualExpenses: Number(form.annualExpenses) || 0,
      mortgageBalance: Number(form.mortgageBalance) || 0,
      term: Number(form.term) || 0,
      rate: Number(form.rate) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
      >
        <h3 className="text-xl font-semibold">Nouvel immeuble</h3>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nom ou adresse"
          className="border rounded p-2 w-full"
          required
        />
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Adresse"
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Ville"
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          name="purchasePrice"
          value={form.purchasePrice}
          onChange={handleChange}
          placeholder="Prix d'achat"
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          name="annualRent"
          value={form.annualRent}
          onChange={handleChange}
          placeholder="Revenus annuels"
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          name="annualExpenses"
          value={form.annualExpenses}
          onChange={handleChange}
          placeholder="Dépenses annuelles"
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          name="mortgageBalance"
          value={form.mortgageBalance}
          onChange={handleChange}
          placeholder="Solde hypothécaire"
          className="border rounded p-2 w-full"
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          name="term"
          value={form.term}
          onChange={handleChange}
          placeholder="Terme (ans)"
          className="border rounded p-2 w-full"
        />
        <input
          type="number"
          step="0.01"
          name="rate"
          value={form.rate}
          onChange={handleChange}
          placeholder="Taux %"
          className="border rounded p-2 w-full"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioPropertyForm;
