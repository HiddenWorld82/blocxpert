import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(`/${location.search}`);
    } catch {
      setError(t('auth.login.error'));
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate(`/${location.search}`);
    } catch {
      setError(t('auth.google.error'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">{t('auth.login.title')}</h2>
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
            {t('auth.login.submit')}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          {t('auth.google')}
        </button>
        <div className="flex justify-between text-sm">
          <Link
            to={`/reset-password${location.search}`}
            className="text-blue-600 hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
          <Link to={`/signup${location.search}`} className="text-blue-600 hover:underline">
            {t('auth.createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
