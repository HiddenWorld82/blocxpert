import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { updateProperty } from '../../services/dataService';
import { X } from 'lucide-react';

const ShareWithBrokerModal = ({ propertyId, onClose, onShared }) => {
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const [includeScenarios, setIncludeScenarios] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const brokerUid = userProfile?.brokerUid;
  const brokerClientId = userProfile?.brokerClientId;

  const handleShare = async () => {
    if (!currentUser?.uid || !propertyId || !brokerUid || !brokerClientId) return;
    setLoading(true);
    setError('');
    try {
      await updateProperty(propertyId, {
        brokerUid,
        clientId: brokerClientId,
        ...(includeScenarios !== false && { shareScenariosWithBroker: true }),
      });
      onShared?.(propertyId);
      onClose?.();
    } catch (e) {
      setError(e?.message || t('share.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('shareWithBroker.title')}</h2>
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
          {t('shareWithBroker.description')}
        </p>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={includeScenarios}
            onChange={(e) => setIncludeScenarios(e.target.checked)}
          />
          <span className="text-sm">{t('shareWithBroker.includeScenarios')}</span>
        </label>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '…' : t('shareWithBroker.confirm')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareWithBrokerModal;
