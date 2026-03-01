import React, { useState } from 'react';
import { User, Building2, Percent, Wallet, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const PERSONAS = [
  { id: 'courtier_immo', icon: Building2, labelKey: 'persona.courtier_immo' },
  { id: 'investisseur', icon: User, labelKey: 'persona.investisseur' },
  { id: 'courtier_hypo', icon: Percent, labelKey: 'persona.courtier_hypo' },
  { id: 'preteur_prive', icon: Wallet, labelKey: 'persona.preteur_prive' },
  { id: 'autre', icon: HelpCircle, labelKey: 'persona.autre' },
];

export default function OnboardingModal() {
  const { t } = useLanguage();
  const { currentUser, userProfile, profileLoading, completeOnboarding } = useAuth();
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const showOnboarding =
    currentUser &&
    !profileLoading &&
    (!userProfile || userProfile.onboardingCompleted !== true);
  if (!showOnboarding) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    try {
      await completeOnboarding(selected);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err?.message || t('profile.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {t('onboarding.title')}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {t('onboarding.question')}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
            {PERSONAS.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  selected === id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium text-center">
                  {t(labelKey)}
                </span>
              </button>
            ))}
          </div>
          {error && (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!selected || submitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {submitting ? t('loading') : t('onboarding.continue')}
          </button>
        </form>
      </div>
    </div>
  );
}
