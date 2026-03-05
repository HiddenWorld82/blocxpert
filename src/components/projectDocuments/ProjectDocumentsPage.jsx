import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  subscribeGeneralDossier,
  addSection,
  updateSectionTitle,
  deleteSection,
  uploadGeneralDossierFile,
  addFileRefToGeneralDossier,
  deleteGeneralDossierFile,
  getGeneralDossierFileDownloadUrl,
} from '../../services/generalDossierService';
import { ArrowLeft, Plus, Upload, Trash2, Download, FileText, X } from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;

function ProjectDocumentsPage({ property, onBack }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [dossierData, setDossierData] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    if (!property?.id) return;
    return subscribeGeneralDossier(property.id, setDossierData);
  }, [property?.id]);

  const documents = dossierData?.documents || {};
  const sectionOrder = dossierData?.sectionOrder || Object.keys(documents);
  const orderedSections = sectionOrder
    .filter((id) => documents[id])
    .map((id) => ({ id, ...documents[id] }));
  const isOwner = currentUser?.uid === property?.uid;

  const handleAddSection = async () => {
    if (!newSectionTitle?.trim() || !property?.id || !currentUser?.uid || !isOwner) return;
    setAddingSection(true);
    setError('');
    try {
      await addSection(property.id, currentUser.uid, newSectionTitle.trim());
      setNewSectionTitle('');
      setAddModalOpen(false);
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setAddingSection(false);
    }
  };

  const handleFileSelect = async (sectionId, file) => {
    if (!file || !property?.id || !currentUser?.uid || !isOwner) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(t('projectDocuments.fileTooBig') || `File must be under ${MAX_FILE_SIZE_MB} MB`);
      return;
    }
    setError('');
    setUploadingFor(sectionId);
    try {
      const fileRef = await uploadGeneralDossierFile(property.id, sectionId, file);
      await addFileRefToGeneralDossier(property.id, currentUser.uid, sectionId, fileRef);
    } catch (e) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteFile = async (sectionId, fileRef) => {
    if (!property?.id || !currentUser?.uid || !isOwner) return;
    try {
      await deleteGeneralDossierFile(property.id, currentUser.uid, sectionId, fileRef);
    } catch (e) {
      setError(e?.message || 'Delete failed');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!property?.id || !currentUser?.uid || !isOwner) return;
    if (!window.confirm(t('projectDocuments.deleteSectionConfirm'))) return;
    try {
      await deleteSection(property.id, currentUser.uid, sectionId);
    } catch (e) {
      setError(e?.message || 'Delete failed');
    }
  };

  const handleDownload = async (fileRef) => {
    try {
      const url = await getGeneralDossierFileDownloadUrl(fileRef.storagePath);
      window.open(url, '_blank');
    } catch (e) {
      setError(e?.message || 'Download failed');
    }
  };

  const fullAddress = [property?.address, property?.city, property?.province, property?.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            {t('back')}
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">{t('projectDocuments.title')}</h1>
          {isOwner && (
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              {t('projectDocuments.addSection')}
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-6">{fullAddress || t('home.address.unset')}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {orderedSections.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center text-gray-500">
            <p>{t('projectDocuments.noFiles')}</p>
            {isOwner && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                {t('projectDocuments.addSection')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orderedSections.map((section) => {
              const fileRefs = section.fileRefs || [];
              const isUploading = uploadingFor === section.id;

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-medium text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      {section.title || section.label || t('projectDocuments.sectionTitlePlaceholder')}
                    </h3>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0"
                        aria-label={t('projectDocuments.deleteSection')}
                        title={t('projectDocuments.deleteSection')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isOwner && (
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm mb-3">
                      <Upload className="w-4 h-4" />
                      {isUploading ? t('projectDocuments.uploading') : t('projectDocuments.upload')}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,image/*"
                        disabled={isUploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileSelect(section.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                  {fileRefs.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('projectDocuments.noFiles')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {fileRefs.map((fileRef, idx) => (
                        <li
                          key={fileRef.storagePath || idx}
                          className="flex items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded border border-gray-100"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1" title={fileRef.name}>
                            {fileRef.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDownload(fileRef)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              aria-label={t('projectDocuments.download')}
                              title={t('projectDocuments.download')}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleDeleteFile(section.id, fileRef)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                aria-label={t('projectDocuments.delete')}
                                title={t('projectDocuments.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{t('projectDocuments.addSectionModalTitle')}</h2>
                <button
                  type="button"
                  onClick={() => { setAddModalOpen(false); setNewSectionTitle(''); setError(''); }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  aria-label={t('cancel')}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{t('projectDocuments.sectionHint')}</p>
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700">{t('projectDocuments.sectionTitlePlaceholder')}</span>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder={t('projectDocuments.sectionHint')}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddSection}
                  disabled={addingSection || !newSectionTitle.trim()}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingSection ? '…' : t('projectDocuments.createSection')}
                </button>
                <button
                  type="button"
                  onClick={() => { setAddModalOpen(false); setNewSectionTitle(''); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDocumentsPage;
