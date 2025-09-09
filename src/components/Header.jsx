import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;

  return (
    <header className="p-4 flex justify-end items-center gap-2 bg-white shadow">
      {currentUser.photoURL && (
        <img
          src={currentUser.photoURL}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
      <span className="text-sm text-gray-700">
        {currentUser.displayName || currentUser.email}
      </span>
      <button
        onClick={logout}
        className="text-sm text-blue-600 hover:underline"
      >
        {t('auth.logout')}
      </button>
    </header>
  );
};

export default Header;
