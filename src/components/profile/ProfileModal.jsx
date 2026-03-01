import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Building2, Percent, Wallet, HelpCircle } from 'lucide-react';

const PERSONAS = [
  { id: 'courtier_immo', icon: Building2, labelKey: 'persona.courtier_immo' },
  { id: 'investisseur', icon: User, labelKey: 'persona.investisseur' },
  { id: 'courtier_hypo', icon: Percent, labelKey: 'persona.courtier_hypo' },
  { id: 'preteur_prive', icon: Wallet, labelKey: 'persona.preteur_prive' },
  { id: 'autre', icon: HelpCircle, labelKey: 'persona.autre' },
];

export default function ProfileModal({ onClose }) {
  const { t } = useLanguage();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [persona, setPersona] = useState('autre');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDisplayName(
      userProfile?.displayName ?? currentUser?.displayName ?? currentUser?.email ?? '',
    );
    setAvatarUrl(userProfile?.avatarUrl ?? currentUser?.photoURL ?? '');
    setPersona(userProfile?.persona ?? 'autre');
  }, [currentUser, userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        persona,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('profile.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label={t('cancel')}
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.displayName')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder={t('profile.displayNamePlaceholder')}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.avatarUrl')}
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://..."
            />
            {avatarUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.persona')}
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {PERSONAS.map(({ id, labelKey }) => (
                <option key={id} value={id}>
                  {t(labelKey)}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
            >
              {saving ? t('loading') : t('profile.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
