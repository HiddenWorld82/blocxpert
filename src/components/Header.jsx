import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import useNetworkStatus from '../hooks/useNetworkStatus';
import ProfileModal from './profile/ProfileModal';

const Header = ({ onNavigateToClients, onNavigateToMarketParams }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { t } = useLanguage();
  const isOnline = useNetworkStatus();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName =
    userProfile?.displayName ?? currentUser?.displayName ?? currentUser?.email ?? '';
  const avatarUrl = userProfile?.avatarUrl ?? currentUser?.photoURL;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <>
      <header className="p-4 flex justify-between items-center bg-white shadow">
        <div className="flex items-center gap-4">
          <img
            src="/rentalyzer-logo.png"
            alt="Rentalyzer logo"
            className="h-12"
          />
          {userProfile?.persona === 'courtier_hypo' && (
            <nav className="flex gap-2">
              <button
                type="button"
                onClick={() => { onNavigateToClients?.(); setDropdownOpen(false); }}
                className="text-sm text-gray-700 hover:text-blue-600 px-2 py-1 rounded"
              >
                {t('home.clients')}
              </button>
              <button
                type="button"
                onClick={() => { onNavigateToMarketParams?.(); setDropdownOpen(false); }}
                className="text-sm text-gray-700 hover:text-blue-600 px-2 py-1 rounded"
              >
                {t('home.marketParams')}
              </button>
            </nav>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg hover:bg-gray-100 px-2 py-1.5 transition-colors"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                {(displayName || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-sm text-gray-700 max-w-[140px] truncate">
              {displayName || t('profile.unknown')}
            </span>
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs font-medium text-white ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? t('network.online') : t('network.offline')}
            >
              {isOnline ? t('network.online') : t('network.offline')}
            </span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-40">
              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t('profile.menuItem')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                {t('auth.logout')}
              </button>
            </div>
          )}
        </div>
      </header>
      {profileModalOpen && (
        <ProfileModal onClose={() => setProfileModalOpen(false)} />
      )}
    </>
  );
};

export default Header;
