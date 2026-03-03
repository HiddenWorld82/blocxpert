import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createShare, addSharedWithMe, getShareRecipientCount } from '../../services/shareService';
import { getUidByEmail, normalizeEmail } from '../../services/userEmailService';
import { queueShareLinkEmail } from '../../services/shareLinkEmailService';
import { X, Copy, Share2 } from 'lucide-react';

const FACEBOOK_SHARER = 'https://www.facebook.com/sharer/sharer.php';

function openFacebookShare(url) {
  const u = encodeURIComponent(url);
  window.open(`${FACEBOOK_SHARER}?u=${u}`, 'facebook-share', 'width=580,height=400');
}

const ShareModal = ({ propertyId, onClose, onShared }) => {
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState('read');
  const [allowSubScenariosEdit, setAllowSubScenariosEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [linkCreated, setLinkCreated] = useState(null);
  const [recipientCount, setRecipientCount] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    if (!linkCreated?.token) return;
    getShareRecipientCount(linkCreated.token).then(setRecipientCount).catch(() => setRecipientCount(0));
  }, [linkCreated?.token]);

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

  const handleCreateLink = async () => {
    if (!currentUser?.uid || !propertyId) return;
    setLoading(true);
    setError('');
    setLinkCreated(null);
    try {
      const { token, url } = await createShare(currentUser.uid, {
        propertyId,
        access,
        allowSubScenariosEdit,
      });
      setLinkCreated({ token, url });
      onShared?.(propertyId);
    } catch (e) {
      setError(e?.message || t('share.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!linkCreated?.url) return;
    navigator.clipboard.writeText(linkCreated.url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const recipientCountText =
    recipientCount != null
      ? (recipientCount === 1
          ? t('shareModal.recipientCount').replace('{count}', recipientCount)
          : (t('shareModal.recipientCount_plural') || t('shareModal.recipientCount')).replace('{count}', recipientCount))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
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
        ) : linkCreated ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{t('shareModal.shareLinkLabel')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={linkCreated.url}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={t('shareModal.linkCopied')}
              >
                <Copy size={18} />
                {linkCopied ? '✓' : ''}
              </button>
            </div>
            <p className="text-sm text-gray-600">{t('shareModal.copyMessageForPost')}</p>
            <div className="flex gap-2">
              <p className="flex-1 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {t('shareModal.facebookSuggestedMessage')}
                <br />
                <span className="text-blue-600 break-all">{linkCreated.url}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  const text = `${t('shareModal.facebookSuggestedMessage')}\n\n${linkCreated.url}`;
                  navigator.clipboard.writeText(text).then(() => {
                    setMessageCopied(true);
                    setTimeout(() => setMessageCopied(false), 2000);
                  });
                }}
                className="shrink-0 flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={t('shareModal.linkCopied')}
              >
                <Copy size={18} />
                {messageCopied ? '✓' : ''}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openFacebookShare(linkCreated.url)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:opacity-90"
              >
                <Share2 size={18} />
                {t('shareModal.shareOnFacebook')}
              </button>
            </div>
            {recipientCountText != null && (
              <p className="text-sm text-gray-600">{recipientCountText}</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 border rounded-lg hover:bg-gray-50"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('shareModal.recipientEmail')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="courriel@exemple.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">{t('shareModal.orShareByLink')}</p>
              <button
                type="button"
                onClick={handleCreateLink}
                disabled={loading}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {t('shareModal.createLink')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
