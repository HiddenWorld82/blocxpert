import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getInviteByToken, updateClient } from '../../services/clientsService';
import { setUserProfile } from '../../services/userProfileService';
import { addBrokerLink } from '../../services/brokerLinksService';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailAlreadyInUse, setEmailAlreadyInUse] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const { currentUser, signup, loginWithGoogle, refreshUserProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const invitationToken = new URLSearchParams(location.search).get('invitation');

  useEffect(() => {
    if (!invitationToken) {
      setInviteLoading(false);
      return;
    }
    getInviteByToken(invitationToken)
      .then((data) => {
        if (data) {
          setInviteData(data);
          if (data.email) setEmail(data.email);
        }
        setInviteLoading(false);
      })
      .catch(() => setInviteLoading(false));
  }, [invitationToken]);

  const [linkingBroker, setLinkingBroker] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const redirectTimerRef = useRef(null);

  // Investisseur déjà connecté qui ouvre le lien d'invitation : lier le courtier, afficher 2 s, puis rediriger
  useEffect(() => {
    if (!currentUser?.uid || !inviteData?.clientId || inviteLoading) return;
    let cancelled = false;
    setLinkError(null);
    setLinkingBroker(true);
    (async () => {
      try {
        try {
          await updateClient(inviteData.clientId, { clientUserId: currentUser.uid });
        } catch (e) {
          // Client déjà lié (ex. deuxième ouverture du lien) : on continue pour mettre à jour le profil et brokerLinks
          console.warn('SignupPage: updateClient', e?.message);
        }
        await setUserProfile(currentUser.uid, {
          persona: 'investisseur',
          onboardingCompleted: true,
          brokerClientId: inviteData.clientId,
          brokerUid: inviteData.brokerUid,
        });
        await addBrokerLink(currentUser.uid, inviteData.brokerUid, inviteData.clientId, inviteData.brokerDisplayName || '');
        if (refreshUserProfile) await refreshUserProfile();
        if (cancelled) return;
        // Laisser le message visible 2 secondes avant la redirection
        redirectTimerRef.current = setTimeout(() => {
          if (!cancelled) {
            navigate('/', { replace: true, state: { shareAdded: false, invitationAccepted: true } });
          }
        }, 2000);
      } catch (e) {
        console.warn('SignupPage: accept invitation while logged in', e?.message);
        if (!cancelled) {
          setLinkError(e?.message || t('auth.linkingBrokerError'));
          setLinkingBroker(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [currentUser?.uid, inviteData?.clientId, inviteData?.brokerUid, inviteLoading, navigate, refreshUserProfile, t]);

  const getAuthErrorMessage = (err) => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') return invitationToken ? t('auth.error.emailAlreadyInUseUseLogin') : t('auth.error.emailAlreadyInUse');
    if (code === 'auth/weak-password') return t('auth.error.weakPassword');
    if (code === 'auth/invalid-email') return t('auth.error.invalidEmail');
    if (code === 'auth/operation-not-allowed') return t('auth.error.operationNotAllowed');
    if (code === 'auth/too-many-requests') return t('auth.error.tooManyRequests');
    if (code === 'auth/account-exists-with-different-credential') return t('auth.error.accountExistsWithDifferentCredential');
    return t('auth.signup.error') + (err?.message ? ` (${err.message})` : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailAlreadyInUse(false);
    try {
      const cred = await signup(email, password);
      const uid = cred?.user?.uid;
      if (uid && inviteData?.clientId) {
        await updateClient(inviteData.clientId, { clientUserId: uid });
        await setUserProfile(uid, {
          persona: 'investisseur',
          onboardingCompleted: true,
          brokerClientId: inviteData.clientId,
          brokerUid: inviteData.brokerUid,
        });
        await addBrokerLink(uid, inviteData.brokerUid, inviteData.clientId, inviteData.brokerDisplayName || '');
      }
      navigate(`/${location.search}`);
    } catch (err) {
      setEmailAlreadyInUse(err?.code === 'auth/email-already-in-use');
      setError(getAuthErrorMessage(err));
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await loginWithGoogle();
      const uid = result?.user?.uid;
      if (uid && inviteData?.clientId) {
        await updateClient(inviteData.clientId, { clientUserId: uid });
        await setUserProfile(uid, {
          persona: 'investisseur',
          onboardingCompleted: true,
          brokerClientId: inviteData.clientId,
          brokerUid: inviteData.brokerUid,
        });
        await addBrokerLink(uid, inviteData.brokerUid, inviteData.clientId, inviteData.brokerDisplayName || '');
      }
      navigate(`/${location.search}`);
    } catch (err) {
      setError(getAuthErrorMessage(err) || t('auth.google.error'));
    }
  };

  // Utilisateur déjà connecté + lien d'invitation : ne jamais afficher le formulaire, lier le courtier puis rediriger
  if (currentUser && invitationToken) {
    if (inviteLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 text-center text-gray-600">{t('loading')}</div>
        </div>
      );
    }
    if (linkError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 text-center space-y-4">
            <p className="text-red-600">{linkError}</p>
            <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {t('auth.goToHome')}
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center text-gray-600">{t('auth.linkingBroker')}</div>
      </div>
    );
  }

  if (inviteLoading && invitationToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  if (linkingBroker && inviteData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center text-gray-600">{t('auth.linkingBroker')}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">{t('auth.signup.title')}</h2>
        {inviteData && (
          <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded">
            {t('auth.signup.invitedByBroker')}
          </p>
        )}
        {error && (
          <div className="p-2 text-red-600 bg-red-100 rounded space-y-2">
            <p>{error}</p>
            {invitationToken && emailAlreadyInUse && (
              <p className="text-sm">
                <Link to={`/login${location.search}`} className="text-blue-600 underline font-medium">
                  {t('auth.signup.useLoginInstead')}
                </Link>
              </p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {t('auth.signup.submit')}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          {t('auth.google')}
        </button>
        <div className="text-sm text-center">
          {t('auth.haveAccount')}{' '}
          <Link to={`/login${location.search}`} className="text-blue-600 hover:underline">
            {t('auth.login.link')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
