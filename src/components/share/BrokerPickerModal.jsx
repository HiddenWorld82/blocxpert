import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getBrokerDisplayName } from '../../services/brokerDisplayNameService';
import { X, UserCheck } from 'lucide-react';

/**
 * When the investor has multiple linked brokers, this modal lets them choose
 * which broker to share the property with.
 * @param {string[]} [alreadySharedBrokerUids] - Broker UIDs that already have this property (shown as "Déjà partagé", disabled).
 */
const BrokerPickerModal = ({ brokers, onClose, onSelect, alreadySharedBrokerUids = [] }) => {
  const { t } = useLanguage();
  const [fetchedNames, setFetchedNames] = useState({});
  const alreadySet = new Set(Array.isArray(alreadySharedBrokerUids) ? alreadySharedBrokerUids : []);

  useEffect(() => {
    if (!brokers?.length) return;
    let cancelled = false;
    brokers.forEach((broker) => {
      const hasName = broker.brokerDisplayName && String(broker.brokerDisplayName).trim();
      if (hasName) return;
      getBrokerDisplayName(broker.brokerUid).then((name) => {
        if (cancelled) return;
        if (name) {
          setFetchedNames((prev) => ({ ...prev, [broker.brokerUid]: name }));
        }
      }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, [brokers]);

  const displayName = (broker) => {
    const stored = broker.brokerDisplayName && String(broker.brokerDisplayName).trim();
    if (stored) return stored;
    if (fetchedNames[broker.brokerUid]) return fetchedNames[broker.brokerUid];
    return t('shareWithBroker.brokerLabel').replace('{index}', String(brokers.indexOf(broker) + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('shareWithBroker.pickBroker')}</h2>
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
          {t('shareWithBroker.pickBrokerHint')}
        </p>
        <div className="space-y-2">
          {brokers.map((broker) => {
            const alreadyShared = alreadySet.has(broker.brokerUid);
            return (
              <button
                key={broker.brokerUid}
                type="button"
                onClick={() => !alreadyShared && onSelect(broker)}
                disabled={alreadyShared}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  alreadyShared
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-75'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50/50'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  alreadyShared ? 'bg-gray-200' : 'bg-blue-100'
                }`}>
                  <UserCheck className={alreadyShared ? 'text-gray-500' : 'text-blue-600'} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`font-medium block truncate ${alreadyShared ? 'text-gray-500' : 'text-gray-900'}`}>
                    {displayName(broker)}
                  </span>
                  {alreadyShared && (
                    <span className="text-xs text-gray-500 font-normal block mt-0.5">
                      {t('shareWithBroker.alreadyShared')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
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

export default BrokerPickerModal;
