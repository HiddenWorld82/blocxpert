import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage = ({ onBack }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('about.back')}
        </button>

        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4">
            {/* La photo professionnelle sera ajoutée ultérieurement */}
            <img
              src="/src/profile.jpg"
              alt={t('about.photoAlt')}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Michael Marceau</h1>
          <h2 className="text-xl text-gray-600 mb-4">
            {t('about.tagline')}
          </h2>
          <p className="text-gray-700">
            {t('about.intro')}
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h3 className="text-2xl font-semibold mb-3">
              {t('about.mvvTitle')}
            </h3>
            <p className="mb-2">
              {t('about.mvv1')}
            </p>
            <p className="mb-2">
              {t('about.mvv2')}
            </p>
            <p>
              <strong>{t('about.valuesLabel')}:&nbsp;</strong>
              {t('about.valuesList')}
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">
              {t('about.backgroundTitle')}
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('about.education')}</li>
              <li>{t('about.entrepreneur')}</li>
              <li>{t('about.investor')}</li>
              <li>{t('about.lender')}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">{t('about.contactTitle')}</h3>
            <ul className="space-y-2">
              <li>
                {t('about.email')}: <a href="mailto:mmarceau@dmii.ca" className="text-blue-600 hover:underline">mmarceau@dmii.ca</a>
              </li>
              <li>
                {t('about.phone')}: <a href="tel:+15145001255" className="text-blue-600 hover:underline">514-500-1255</a>
              </li>
              <li>
                {t('about.linkedin')}: <a href="https://www.linkedin.com/in/michael-marceau-23a6b570/" className="text-blue-600 hover:underline">linkedin.com/in/michael-marceau-23a6b570/</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

