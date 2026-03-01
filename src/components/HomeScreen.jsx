// components/HomeScreen.jsx
import React from 'react';
import {
  Calculator,
  Plus,
  Home,
  TrendingUp,
  FileText,
  Trash2,
  Share2,
  DollarSign,
  Users,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CmbRates from './CmbRates';

function PropertyCard({ property, index, isOwner, isNewClientProperty, onSelect, onShare, onDelete, t, isBrokerView = false }) {
  const fullAddress = [
    property.address,
    property.city,
    property.province,
    property.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <div
      key={property.id || index}
      className="relative border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(property)}
    >
      {isNewClientProperty(property) && (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-amber-400 text-amber-900 rounded">
          {t('home.newBadge')}
        </span>
      )}
      {isOwner(property) && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(property.id);
            }}
            className="absolute top-2 right-10 text-blue-600 hover:text-blue-800"
            aria-label={t('home.share')}
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(property.id);
            }}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
            aria-label={t('home.delete')}
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
      {!isOwner(property) && onShare && !(isBrokerView && property.fromClient) && (
        <button
          onClick={(e) => { e.stopPropagation(); onShare(property.id); }}
          className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
          aria-label={t('home.share')}
        >
          <Share2 size={16} />
        </button>
      )}
      <h3 className="font-semibold text-lg mb-3">
        {fullAddress || t('home.address.unset')}
      </h3>
      <div className="flex flex-wrap text-sm text-gray-600 gap-y-1 mb-2">
        <div className="w-1/2 flex items-center">
          <Home className="w-4 h-4 mr-1 text-blue-600" />
          {property.numberOfUnits} {t('home.units')}
        </div>
        <div className="w-1/2 flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
          {Number(property.purchasePrice || 0).toLocaleString('fr-CA')}$
        </div>
        <div className="w-1/2 flex items-center">
          <Calculator className="w-4 h-4 mr-1 text-purple-600" />
          {property.numberOfUnits ? (property.purchasePrice / property.numberOfUnits).toLocaleString('fr-CA') : '—'}{t('home.pricePerDoor')}
        </div>
      </div>
      <div
        className={`mt-2 inline-block px-2 py-1 text-sm font-medium rounded ${
          (property.effectiveNetIncome ?? 0) >= 0
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {(property.effectiveNetIncome ?? 0) >= 0 ? '+' : ''}
        {Math.round(property.effectiveNetIncome ?? 0).toLocaleString('fr-CA')}{t('home.perYear')}
      </div>
    </div>
  );
}

function SharedWithMeCard({ item, onSelect, onRemove, t }) {
  const fullAddress = [item.address, item.city, item.province, item.postalCode]
    .filter(Boolean)
    .join(', ') || t('home.address.unset');
  return (
    <div
      role="button"
      tabIndex={0}
      className="relative border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(item.id, item.shareToken)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(item.id, item.shareToken)}
    >
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(item.id, item.shareToken); }}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1"
          aria-label={t('home.removeFromDashboard')}
          title={t('home.removeFromDashboard')}
        >
          <Trash2 size={16} />
        </button>
      )}
      {!item.seen && (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-amber-400 text-amber-900 rounded">
          {t('home.newBadge')}
        </span>
      )}
      <h3 className="font-semibold text-lg mb-3">{fullAddress}</h3>
      <div className="flex flex-wrap text-sm text-gray-600 gap-y-1 mb-2">
        {item.numberOfUnits != null && (
          <div className="w-1/2 flex items-center">
            <Home className="w-4 h-4 mr-1 text-blue-600" />
            {item.numberOfUnits} {t('home.units')}
          </div>
        )}
        {item.purchasePrice != null && (
          <div className="w-1/2 flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
            {Number(item.purchasePrice).toLocaleString('fr-CA')}$
          </div>
        )}
      </div>
      {item.effectiveNetIncome != null && (
        <div
          className={`mt-2 inline-block px-2 py-1 text-sm font-medium rounded ${
            (item.effectiveNetIncome ?? 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {(item.effectiveNetIncome ?? 0) >= 0 ? '+' : ''}
          {Math.round(item.effectiveNetIncome ?? 0).toLocaleString('fr-CA')}{t('home.perYear')}
        </div>
      )}
    </div>
  );
}

const HomeScreen = ({
  properties,
  sharedWithMe = [],
  onSelectSharedWithMe,
  onRemoveSharedWithMe,
  onNew,
  onSelect,
  onDelete,
  onShare,
  onAbout,
  currentUserId,
  clients = [],
  isBrokerView = false,
}) => {
  const { t } = useLanguage();
  const isOwner = (p) => p.uid === currentUserId;
  const isNewClientProperty = (p) => p.fromClient && !p.brokerSeenAt;

  const myAnalyses = isBrokerView ? properties.filter((p) => !p.fromClient) : properties;
  const clientIdsSet = React.useMemo(() => new Set(clients.map((c) => c.id)), [clients]);
  const clientProperties = isBrokerView
    ? properties.filter((p) => p.fromClient && p.clientId && clientIdsSet.has(p.clientId))
    : [];
  const getClientLabel = (clientId) => {
    if (clientId === '_sans_client_') return null;
    const c = clients.find((x) => x.id === clientId);
    return c ? (c.name || c.email || c.id) : clientId;
  };

  const byClientEntries = React.useMemo(() => {
    const map = {};
    clientProperties.forEach((p) => {
      const cid = p.clientId || '_sans_client_';
      if (!map[cid]) map[cid] = [];
      map[cid].push(p);
    });
    const entries = Object.entries(map);
    entries.sort(([idA], [idB]) => {
      if (idA === '_sans_client_') return 1;
      if (idB === '_sans_client_') return -1;
      const cA = clients.find((x) => x.id === idA);
      const cB = clients.find((x) => x.id === idB);
      const labelA = cA ? (cA.name || cA.email || idA) : idA;
      const labelB = cB ? (cB.name || cB.email || idB) : idB;
      return String(labelA).localeCompare(String(labelB));
    });
    return entries;
  }, [clientProperties, clients]);


  const totalCount = properties.length;
  const showBrokerSections = isBrokerView && (myAnalyses.length > 0 || clientProperties.length > 0);
  const showClientTabs = !isBrokerView && (properties.length > 0 || sharedWithMe.length > 0);
  const [activeTab, setActiveTab] = React.useState('myAnalyses');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <img
            src="/rentalyzer-logo.png"
            alt="Rentalyzer logo"
            width={200}
            className="inline-block"
          />
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.subtitle')}
          </p>
        </div>

        {totalCount === 0 && sharedWithMe.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">{t('home.empty.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('home.step1.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('home.step1.text')}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('home.step2.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('home.step2.text')}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('home.step3.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('home.step3.text')}
                </p>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={onNew}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="inline-block mr-2" />
                {t('home.new.button')}
              </button>
            </div>
          </div>
        ) : showBrokerSections ? (
          <div className="mb-8">
            {/* Onglets */}
            <div className="bg-white rounded-t-lg shadow border-b border-gray-200">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('myAnalyses')}
                  className={`flex-1 sm:flex-none px-4 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'myAnalyses'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {t('home.sectionMyAnalyses')}
                  {myAnalyses.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === 'myAnalyses' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      {myAnalyses.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('clientProperties')}
                  className={`flex-1 sm:flex-none px-4 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'clientProperties'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {t('home.sectionClientProperties')}
                  {clientProperties.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === 'clientProperties' ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {clientProperties.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Contenu onglet Mes Analyses */}
            {activeTab === 'myAnalyses' && (
              <div className="bg-white rounded-b-lg shadow-lg p-6 border border-t-0 border-gray-200">
                <div className="flex flex-col mb-4 md:flex-row md:justify-between md:items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {t('home.sectionMyAnalyses')}
                  </h2>
                  <button
                    onClick={onNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2 md:mt-0"
                  >
                    <Plus className="inline-block mr-1" size={18} />
                    {t('home.existing.new')}
                  </button>
                </div>
                {myAnalyses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {myAnalyses.map((property, index) => (
                      <PropertyCard
                        key={property.id || index}
                        property={property}
                        index={index}
                        isOwner={isOwner}
                        isNewClientProperty={isNewClientProperty}
                        onSelect={onSelect}
                        onShare={onShare}
                        onDelete={onDelete}
                        t={t}
                        isBrokerView={isBrokerView}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">{t('home.noMyAnalyses')}</p>
                )}
              </div>
            )}

            {/* Contenu onglet Immeubles Clients — regroupés par client */}
            {activeTab === 'clientProperties' && (
              <div className="bg-white rounded-b-lg shadow-lg p-6 border border-t-0 border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  {t('home.sectionClientProperties')}
                </h2>
                {clientProperties.length === 0 ? (
                  <p className="text-gray-500 text-sm py-2">{t('home.noClientProperties')}</p>
                ) : (
                  <div className="space-y-8">
                    {byClientEntries.map(([clientId, props]) => {
                      const label = getClientLabel(clientId);
                      const count = props.length;
                      const countLabel = t('home.clientPropertiesCount').replace('{{count}}', String(count));
                      return (
                        <div key={clientId} className="border-l-4 border-green-400 pl-4">
                          <h3 className="font-medium text-gray-800 mb-1">
                            {label || t('home.unknownClient')}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">{countLabel}</p>
                          <div className="grid gap-4 md:grid-cols-2">
                            {props.map((property, index) => (
                              <PropertyCard
                                key={property.id || index}
                                property={property}
                                index={index}
                                isOwner={isOwner}
                                isNewClientProperty={isNewClientProperty}
                                onSelect={onSelect}
                                onShare={onShare}
                                onDelete={onDelete}
                                t={t}
                                isBrokerView={isBrokerView}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showClientTabs ? (
          <div className="mb-8">
            {/* Onglets Mes analyses | Partagés avec moi (client) */}
            <div className="bg-white rounded-t-lg shadow border-b border-gray-200">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('myAnalyses')}
                  className={`flex-1 sm:flex-none px-4 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'myAnalyses'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {t('home.sectionMyAnalyses')}
                  {properties.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === 'myAnalyses' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      {properties.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sharedWithMe')}
                  className={`flex-1 sm:flex-none px-4 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'sharedWithMe'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  {t('home.tabSharedWithMe')}
                  {sharedWithMe.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${activeTab === 'sharedWithMe' ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                      {sharedWithMe.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'myAnalyses' && (
              <div className="bg-white rounded-b-lg shadow-lg p-6 border border-t-0 border-gray-200">
                <div className="flex flex-col mb-4 md:flex-row md:justify-between md:items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {t('home.sectionMyAnalyses')}
                  </h2>
                  <button
                    onClick={onNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2 md:mt-0"
                  >
                    <Plus className="inline-block mr-1" size={18} />
                    {t('home.existing.new')}
                  </button>
                </div>
                {properties.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {properties.map((property, index) => (
                      <PropertyCard
                        key={property.id || index}
                        property={property}
                        index={index}
                        isOwner={isOwner}
                        isNewClientProperty={isNewClientProperty}
                        onSelect={onSelect}
                        onShare={onShare}
                        onDelete={onDelete}
                        t={t}
                        isBrokerView={isBrokerView}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">{t('home.noMyAnalyses')}</p>
                )}
              </div>
            )}

            {activeTab === 'sharedWithMe' && (
              <div className="bg-white rounded-b-lg shadow-lg p-6 border border-t-0 border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  {t('home.sharedWithYou')}
                </h2>
                {sharedWithMe.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {sharedWithMe.map((item) => (
                      <SharedWithMeCard
                        key={item.id}
                        item={item}
                        onSelect={onSelectSharedWithMe}
                        onRemove={onRemoveSharedWithMe}
                        t={t}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-2">{t('home.noSharedWithMe')}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col items-center mb-6 md:flex-row md:justify-between md:items-center">
              <h2 className="text-2xl font-semibold mb-4 md:mb-0">{t('home.existing.title')}</h2>
              <button
                onClick={onNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="inline-block mr-1" />
                {t('home.existing.new')}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property.id || index}
                  property={property}
                  index={index}
                  isOwner={isOwner}
                  isNewClientProperty={isNewClientProperty}
                  onSelect={onSelect}
                  onShare={onShare}
                  onDelete={onDelete}
                  t={t}
                  isBrokerView={isBrokerView}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-8">
          <button onClick={onAbout} className="hover:underline">
            {t('home.about')}
          </button>
          <CmbRates />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
