import React, { useState, useEffect } from 'react';
import { getShare } from '../../services/shareService';
import SharedPropertyView from './SharedPropertyView';

function getShareParam() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash || '';
  const qs = hash.indexOf('?') >= 0 ? hash.slice(hash.indexOf('?')) : '';
  const params = new URLSearchParams(qs);
  return params.get('share');
}

function isTokenFormat(share) {
  if (!share || typeof share !== 'string') return false;
  return share.length === 32 && /^[0-9a-fA-F]+$/.test(share);
}

/**
 * When the URL contains share=TOKEN (token format), load the share and render
 * SharedPropertyView without requiring auth. Otherwise render children.
 */
export default function ShareViewGate({ children }) {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const share = getShareParam();
    if (!isTokenFormat(share)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getShare(share)
      .then((data) => {
        if (!cancelled && data?.snapshot) setShareData(data);
        else if (!cancelled) setError('Invalid or expired link');
      })
      .catch(() => {
        if (!cancelled) setError('Invalid or expired link');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading && getShareParam() && isTokenFormat(getShareParam())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-600">Chargement…</span>
      </div>
    );
  }

  if (shareData) {
    return <SharedPropertyView shareData={shareData} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return children;
}
