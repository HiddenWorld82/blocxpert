import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getFinancementDossiersByProperty } from '../services/financementDossierService';
import { getGeneralDossier } from '../services/generalDossierService';
import { X } from 'lucide-react';

function DeletePropertyConfirmModal({ property, onClose, onConfirm }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dossierCount, setDossierCount] = useState(0);
  const [hasProjectDocuments, setHasProjectDocuments] = useState(false);

  useEffect(() => {
    if (!property?.id || !property?.uid) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      getFinancementDossiersByProperty(property.id, property.uid),
      getGeneralDossier(property.id),
    ]).then(([dossiers, generalDossier]) => {
      if (cancelled) return;
      const activeDossiers = (dossiers || []).filter((d) => d.status !== 'cancelled');
      setDossierCount(activeDossiers.length);
      const docs = generalDossier?.documents || {};
      const order = generalDossier?.sectionOrder;
      const hasSections = Array.isArray(order) ? order.length > 0 : Object.keys(docs).length > 0;
      setHasProjectDocuments(hasSections);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [property?.id, property?.uid]);

  const brokerCount = property?.sharedWithBrokerUids?.length ?? (property?.brokerUid ? 1 : 0);
  const hasCollaborations = brokerCount > 0 || dossierCount > 0 || hasProjectDocuments;
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await Promise.resolve(onConfirm?.());
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('deleteProperty.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label={t('cancel')}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-700 text-sm mb-4">{t('deleteProperty.confirmMessage')}</p>

        {loading ? (
          <p className="text-sm text-gray-500 mb-4">…</p>
        ) : hasCollaborations ? (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <p className="font-medium mb-2">{t('deleteProperty.warningIntro')}</p>
            <ul className="list-disc list-inside space-y-1">
              {brokerCount > 0 && (
                <li>{t('deleteProperty.warningBrokers').replace('{count}', String(brokerCount))}</li>
              )}
              {dossierCount > 0 && (
                <li>{t('deleteProperty.warningDossiers').replace('{count}', String(dossierCount))}</li>
              )}
              {hasProjectDocuments && (
                <li>{t('deleteProperty.warningProjectDocuments')}</li>
              )}
            </ul>
            <p className="mt-2">{t('deleteProperty.warningOutro')}</p>
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? '…' : (hasCollaborations ? t('deleteProperty.deleteAnyway') : t('deleteProperty.deleteButton'))}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePropertyConfirmModal;
