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
          Retour
        </button>

        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4">
            {/* La photo professionnelle sera ajoutée ultérieurement */}
            <img
              src="/profile.jpg"
              alt="Photo du développeur"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Votre Nom</h1>
          <h2 className="text-xl text-gray-600 mb-4">
            Actuaire, entrepreneur et investisseur immobilier
          </h2>
          <p className="text-gray-700">
            Passionné par l'analyse financière et l'immobilier, j'ai développé BlocXpert
            pour offrir aux investisseurs un outil simple et fiable afin de valider
            les rendements réels de leurs projets.
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h3 className="text-2xl font-semibold mb-3">
              Mission, vision et valeurs de l'application
            </h3>
            <p className="mb-2">
              BlocXpert est né du désir de démocratiser l'analyse de rentabilité
              immobilière et d'aider les investisseurs à prendre des décisions éclairées.
            </p>
            <p className="mb-2">
              À long terme, l'objectif est d'accompagner les investisseurs pour
              comprendre leurs placements et valider les rendements réels qu'ils
              génèrent.
            </p>
            <p>
              <strong>Valeurs&nbsp;:</strong> Simplicité, Fiabilité, Éthique
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">Parcours professionnel</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Détenteur d'un baccalauréat en actuariat</li>
              <li>Entrepreneur depuis l'âge de 20 ans</li>
              <li>Investisseur immobilier d'expérience</li>
              <li>
                Prêteur privé (via Omega Capital Privé et Société de Crédit Immo
                Québec)
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

