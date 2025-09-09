import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;

  return (
    <header className="p-4 flex justify-between items-center bg-white shadow">
      <img
        src="/rentalyzer-logo.png"
        alt="Rentalyzer logo"
        className="h-8"
      />
      <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
};

export default Header;
