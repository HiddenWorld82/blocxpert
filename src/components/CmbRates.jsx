import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CmbRates = () => {
  const { t } = useLanguage();
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://www.bankofcanada.ca/valet/observations/group/cmb?recent=1');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const obs = data?.observations?.[0] || {};
        setRates({
          one: obs.CMB1?.v,
          five: obs.CMB5?.v,
          ten: obs.CMB10?.v,
        });
        setError(false);
      } catch (e) {
        console.error('Failed to fetch CMB rates', e);
        setError(true);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60 * 60 * 1000); // refresh hourly
    return () => clearInterval(interval);
  }, []);

  const formatRate = (value) =>
    value !== undefined ? parseFloat(value).toFixed(2) : 'N/A';

  if (error) {
    return (
      <div className="text-center text-sm text-red-500 mt-2">
        {t('home.cmb.error')}
      </div>
    );
  }

  if (!rates) {
    return (
      <div className="text-center text-sm text-gray-500 mt-2">
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="text-center text-sm text-gray-500 mt-2">
      <h3 className="font-medium">{t('home.cmb.title')}</h3>
      <p>
        {t('home.cmb.oneYear')}: {formatRate(rates.one)}% |{' '}
        {t('home.cmb.fiveYear')}: {formatRate(rates.five)}% |{' '}
        {t('home.cmb.tenYear')}: {formatRate(rates.ten)}%
      </p>
    </div>
  );
};

export default CmbRates;

