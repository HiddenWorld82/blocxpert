import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getChecklistsOnce } from '../../services/checklistService';
import {
  createFinancementDossier,
  updateFinancementDossierChecklist,
  cancelFinancementDossier,
} from '../../services/financementDossierService';
import { X } from 'lucide-react';

const RequestDossierModal = ({ property, onClose, onRequested, existingDossiers = [] }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const hasExisting = existingDossiers.length > 0;
  const existingDossier = hasExisting ? existingDossiers[0] : null;

  useEffect(() => {
    if (!currentUser?.uid) return;
    getChecklistsOnce(currentUser.uid).then(setChecklists);
  }, [currentUser?.uid]);

  const handleCreate = async () => {
    if (!selectedChecklistId || !property?.id || !property?.uid || !currentUser?.uid) return;
    const checklist = checklists.find((c) => c.id === selectedChecklistId);
    if (!checklist?.items?.length) {
      setError(t('financementDossier.selectChecklistWithItems'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createFinancementDossier({
        propertyId: property.id,
        ownerUid: property.uid,
        brokerUid: currentUser.uid,
        brokerDisplayName: currentUser.displayName || null,
        checklistId: checklist.id,
        checklistSnapshot: { items: checklist.items },
      });
      onRequested?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChecklist = async () => {
    if (!existingDossier?.id || !selectedChecklistId) return;
    const checklist = checklists.find((c) => c.id === selectedChecklistId);
    if (!checklist?.items?.length) {
      setError(t('financementDossier.selectChecklistWithItems'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await updateFinancementDossierChecklist(existingDossier.id, checklist.id, { items: checklist.items });
      onRequested?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!existingDossier?.id) return;
    setLoading(true);
    setError('');
    try {
      await cancelFinancementDossier(existingDossier.id);
      setConfirmCancel(false);
      onRequested?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('financementDossier.request')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label={t('cancel')}
          >
            <X size={20} />
          </button>
        </div>

        {hasExisting ? (
          <>
            <p className="text-gray-600 text-sm mb-4">{t('financementDossier.activeRequestDescription')}</p>
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">{t('financementDossier.selectChecklist')}</span>
              <select
                value={selectedChecklistId}
                onChange={(e) => setSelectedChecklistId(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">—</option>
                {checklists.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.id} {c.isDefault ? `(${t('checklists.isDefault')})` : ''}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            {!confirmCancel ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleUpdateChecklist}
                  disabled={loading || !selectedChecklistId}
                  className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '…' : t('financementDossier.updateChecklist')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="w-full py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                >
                  {t('financementDossier.cancelRequest')}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">{t('financementDossier.cancelRequestConfirm')}</p>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? '…' : t('financementDossier.cancelRequest')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmCancel(false); setError(''); }}
                    disabled={loading}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    {t('back')}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-4">{t('financementDossier.requestDescription')}</p>
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">{t('financementDossier.selectChecklist')}</span>
              <select
                value={selectedChecklistId}
                onChange={(e) => setSelectedChecklistId(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="">—</option>
                {checklists.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.id} {c.isDefault ? `(${t('checklists.isDefault')})` : ''}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading || !selectedChecklistId}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '…' : t('financementDossier.request')}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                {t('cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestDossierModal;
