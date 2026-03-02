import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, UserCheck, Mail } from 'lucide-react';

/**
 * When the user is a client of a broker, this modal lets them choose
 * to share the property with their broker or by email (link).
 */
const ShareMethodChoiceModal = ({ propertyId, onClose, onChooseBroker, onChooseEmail }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('shareMethodChoice.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label={t('cancel')}
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {t('shareMethodChoice.description')}
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onChooseBroker?.(propertyId)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCheck className="text-blue-600" size={20} />
            </div>
            <div>
              <span className="font-medium text-gray-900">{t('shareMethodChoice.withBroker')}</span>
              <p className="text-sm text-gray-500">{t('shareMethodChoice.withBrokerHint')}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChooseEmail?.(propertyId)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="text-gray-600" size={20} />
            </div>
            <div>
              <span className="font-medium text-gray-900">{t('shareMethodChoice.byEmail')}</span>
              <p className="text-sm text-gray-500">{t('shareMethodChoice.byEmailHint')}</p>
            </div>
          </button>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareMethodChoiceModal;
