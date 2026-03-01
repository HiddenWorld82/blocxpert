import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getMarketParamsVersions,
  createMarketParamsVersion,
} from '../../services/marketParamsService';
import { setUserProfile } from '../../services/userProfileService';
import { ArrowLeft, Plus, Check } from 'lucide-react';

const MarketParamsPage = ({ onBack }) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { t } = useLanguage();
  const [versions, setVersions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = getMarketParamsVersions(currentUser.uid, setVersions);
    return () => unsub?.();
  }, [currentUser?.uid]);

  const selectedId = userProfile?.selectedMarketParamsId || null;

  const handleCreate = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      await createMarketParamsVersion(currentUser.uid, {
        label: newLabel || t('marketParams.newVersion'),
        version: versions.length + 1,
        data: {},
      });
      setNewLabel('');
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUseInPdf = async (id) => {
    if (!currentUser?.uid) return;
    await setUserProfile(currentUser.uid, { selectedMarketParamsId: id });
    await refreshUserProfile();
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            {t('back')}
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">{t('marketParams.title')}</h1>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            {t('marketParams.newVersion')}
          </button>
        </div>

        {showAdd && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('marketParams.versionLabel')}
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={t('marketParams.newVersion')}
              className="border rounded px-3 py-2 w-full mb-3"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '…' : t('save')}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setNewLabel(''); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <p className="p-4 text-sm text-gray-500 border-b">
            {t('marketParams.defaultRates')}. {t('marketParams.useInPdf')} :
          </p>
          {versions.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">
              Aucune version. Créez une version pour la référencer dans vos PDF.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {versions.map((v) => (
                <li key={v.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{v.label || 'Sans titre'}</p>
                    <p className="text-sm text-gray-500">
                      {t('marketParams.updatedAt')} {formatDate(v.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUseInPdf(v.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                      selectedId === v.id
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedId === v.id && <Check size={16} />}
                    {t('marketParams.useInPdf')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketParamsPage;
