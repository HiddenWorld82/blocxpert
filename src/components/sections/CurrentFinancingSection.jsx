import React from 'react';
import FormattedNumberInput from '../FormattedNumberInput';
import { Calculator } from 'lucide-react';

const CurrentFinancingSection = ({ financing = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...financing, [field]: value });
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-purple-600 flex items-center"><Calculator className="w-5 h-5 mr-2" />Financement en cours</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type de financement</label>
          <input
            type="text"
            value={financing.financingType || ''}
            onChange={(e) => handleChange('financingType', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Institution bancaire</label>
          <input
            type="text"
            value={financing.bank || ''}
            onChange={(e) => handleChange('bank', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Montant financé</label>
          <FormattedNumberInput
            value={financing.financedAmount || ''}
            onChange={(val) => handleChange('financedAmount', val)}
            className="w-full border rounded p-2"
            placeholder="0"
            type="currency"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Taux d'intérêt (%)</label>
          <FormattedNumberInput
            value={financing.interestRate || ''}
            onChange={(val) => handleChange('interestRate', val)}
            className="w-full border rounded p-2"
            placeholder="0"
            type="percentage"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date de début du prêt</label>
          <input
            type="date"
            value={financing.loanStartDate || ''}
            onChange={(e) => handleChange('loanStartDate', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Durée d'amortissement (années)</label>
          <FormattedNumberInput
            value={financing.amortization || ''}
            onChange={(val) => handleChange('amortization', val)}
            className="w-full border rounded p-2"
            placeholder="25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fin du terme en cours</label>
          <input
            type="date"
            value={financing.termEndDate || ''}
            onChange={(e) => handleChange('termEndDate', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentFinancingSection;
