import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CmbRates = () => {
  const { t } = useLanguage();
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      const getRate = async (term) => {
  // Essayez les 7 derniers jours ouvrables
  for (let daysBack = 1; daysBack <= 7; daysBack++) {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const formatted = date.toISOString().split('T')[0];
    
    const url = `https://www.bankofcanada.ca/valet/observations/BD.CDN.${term}YR.DQ.YLD/json?start_date=${formatted}&end_date=${formatted}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Series BD.CDN.${term}YR.DQ.YLD not found`);
          return undefined; // Cette série n'existe pas
        }
        continue; // Essayez la date suivante
      }
      
      const data = await response.json();
      const obs = data?.observations?.[0];
      
      if (obs) {
        const key = `BD.CDN.${term}YR.DQ.YLD`;
        return obs[key]?.v;
      }
    } catch (error) {
      console.error(`Error fetching ${term}YR for date ${formatted}:`, error);
    }
  }
  
  return undefined; // Aucune donnée trouvée
};

      try {
        const [one, five, ten] = await Promise.all([
          getRate('1'),
          getRate('5'),
          getRate('10'),
        ]);
        console.log('Results from Promise.all:', { one, five, ten });
        setRates({ one, five, ten });
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

