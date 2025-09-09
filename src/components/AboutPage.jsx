import React from 'react';
import { ArrowLeft } from 'lucide-react';

const AboutPage = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour / Back
        </button>

        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4">
            {/* La photo professionnelle sera ajoutée ultérieurement */}
            <img
              src="/src/profile.jpg"
              alt="Photo du développeur / Developer photo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Michael Marceau</h1>
          <h2 className="text-xl text-gray-600 mb-4">
            Actuaire de formation, entrepreneur et investisseur immobilier /
            Actuary by training, entrepreneur and real estate investor
          </h2>
          <p className="text-gray-700">
            Passionné par l'analyse financière et l'immobilier, j'ai développé Rentalyzer
            pour offrir aux investisseurs un outil simple et fiable afin de valider
            les rendements réels de leurs projets. / Passionate about financial
            analysis and real estate, I developed Rentalyzer to provide investors
            with a simple and reliable tool to validate the actual returns of their
            projects.
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h3 className="text-2xl font-semibold mb-3">
              Mission, vision et valeurs de l'application / Application mission,
              vision, and values
            </h3>
            <p className="mb-2">
              Rentalyzer est né du désir de démocratiser l'analyse de rentabilité
              immobilière et d'aider les investisseurs à prendre des décisions
              éclairées. / Rentalyzer was born from the desire to democratize real
              estate profitability analysis and help investors make informed
              decisions.
            </p>
            <p className="mb-2">
              À long terme, l'objectif est d'accompagner les investisseurs pour
              comprendre leurs placements et valider les rendements réels qu'ils
              génèrent. / In the long term, the goal is to support investors in
              understanding their investments and validating the actual returns
              they generate.
            </p>
            <p>
              <strong>Valeurs / Values:&nbsp;</strong> Simplicité, Fiabilité,
              Éthique / Simplicity, Reliability, Ethics
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">
              Parcours professionnel / Professional background
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Détenteur d'un baccalauréat en actuariat / Holder of a bachelor's
                degree in actuarial science
              </li>
              <li>Entrepreneur depuis l'âge de 20 ans / Entrepreneur since the age of 20</li>
              <li>
                Investisseur immobilier d'expérience / Experienced real estate
                investor
              </li>
              <li>
                Prêteur privé (via Omega Capital Privé et Société de Crédit Immo
                Québec) / Private lender (through Omega Capital Privé and Société
                de Crédit Immo Québec)
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">Contact / Contact</h3>
            <ul className="space-y-2">
              <li>
                Courriel / Email: <a href="mailto:mmarceau@dmii.ca" className="text-blue-600 hover:underline">mmarceau@dmii.ca</a>
              </li>
              <li>
                Téléphone / Phone: <a href="tel:+15145001255" className="text-blue-600 hover:underline">514-500-1255</a>
              </li>
              <li>
                LinkedIn: <a href="https://www.linkedin.com/in/michael-marceau-23a6b570/" className="text-blue-600 hover:underline">linkedin.com/in/michael-marceau-23a6b570/</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

