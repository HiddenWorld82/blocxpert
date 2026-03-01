import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getInviteByToken, updateClient } from '../../services/clientsService';
import { setUserProfile } from '../../services/userProfileService';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const { signup, loginWithGoogle } = useAuth();
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

  const getAuthErrorMessage = (err) => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') return t('auth.error.emailAlreadyInUse');
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
      }
      navigate('/');
    } catch (err) {
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
      }
      navigate('/');
    } catch (err) {
      setError(getAuthErrorMessage(err) || t('auth.google.error'));
    }
  };

  if (inviteLoading && invitationToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center text-gray-600">{t('loading')}</div>
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
        {error && <div className="p-2 text-red-600 bg-red-100 rounded">{error}</div>}
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
