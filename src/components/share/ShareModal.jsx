import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createShare, addSharedWithMe } from '../../services/shareService';
import { getUidByEmail, normalizeEmail } from '../../services/userEmailService';
import { queueShareLinkEmail } from '../../services/shareLinkEmailService';
import { X } from 'lucide-react';

const ShareModal = ({ propertyId, onClose, onShared }) => {
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState('read');
  const [allowSubScenariosEdit, setAllowSubScenariosEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeEmail(email);
    if (!normalized) {
      setError(t('shareModal.emailRequired'));
      return;
    }
    if (!currentUser?.uid || !propertyId) return;
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const { token, url, snapshot } = await createShare(currentUser.uid, {
        propertyId,
        access,
        allowSubScenariosEdit,
      });
      const recipientUid = await getUidByEmail(normalized);
      if (recipientUid) {
        await addSharedWithMe(recipientUid, currentUser.uid, token, snapshot);
        setSuccess(t('shareModal.sentToAccount').replace('{email}', normalized));
      } else {
        await queueShareLinkEmail({
          to: normalized,
          shareLink: url,
          senderName: userProfile?.displayName || currentUser?.displayName || currentUser?.email || '',
        });
        setSuccess(t('shareModal.sentByEmail').replace('{email}', normalized));
      }
      onShared?.(propertyId);
      setTimeout(() => onClose?.(), 2500);
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
          <h2 className="text-lg font-semibold">{t('shareModal.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label={t('cancel')}
          >
            <X size={20} />
          </button>
        </div>
        {success ? (
          <p className="text-green-600 text-sm">{success}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('shareModal.access')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="access"
                    value="read"
                    checked={access === 'read'}
                    onChange={() => setAccess('read')}
                  />
                  {t('shareModal.accessRead')}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="access"
                    value="write"
                    checked={access === 'write'}
                    onChange={() => setAccess('write')}
                  />
                  {t('shareModal.accessWrite')}
                </label>
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={allowSubScenariosEdit}
                  onChange={(e) => setAllowSubScenariosEdit(e.target.checked)}
                />
                <span className="text-sm">{t('shareModal.allowSubScenarios')}</span>
              </label>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('shareModal.recipientEmail')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="courriel@exemple.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              autoFocus
              disabled={loading}
            />
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '…' : t('shareModal.send')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
