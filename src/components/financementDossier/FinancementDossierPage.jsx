import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getGeneralDossier } from '../../services/generalDossierService';
import { getGeneralDossierFileDownloadUrl } from '../../services/generalDossierService';
import {
  getFinancementDossier,
  updateFinancementDossier,
  uploadDossierFile,
} from '../../services/financementDossierService';
import { CheckSquare, Upload, Download, Trash2 } from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;

function FinancementDossierPage({ dossier: initialDossier, property, onBack }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [dossier, setDossier] = useState(initialDossier);
  const [generalDossier, setGeneralDossier] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dossierLoadDone, setDossierLoadDone] = useState(false);

  useEffect(() => {
    if (!initialDossier?.id) {
      setDossierLoadDone(true);
      return;
    }
    setDossierLoadDone(false);
    setError('');
    getFinancementDossier(initialDossier.id)
      .then((data) => {
        if (data == null) {
          setError(t('financementDossier.notFound'));
          setDossier(null);
        } else {
          setDossier(data);
        }
      })
      .catch((e) => {
        setError(e?.message || t('financementDossier.loadError'));
        setDossier(null);
      })
      .finally(() => setDossierLoadDone(true));
  }, [initialDossier?.id, t]);

  useEffect(() => {
    if (!property?.id) return;
    getGeneralDossier(property.id)
      .then(setGeneralDossier)
      .catch(() => setGeneralDossier(null));
  }, [property?.id]);

  const items = Array.isArray(dossier?.checklistSnapshot?.items) ? dossier.checklistSnapshot.items : [];
  const responses = dossier?.responses || {};
  const isOwner = currentUser?.uid === dossier?.ownerUid;
  const isSubmitted = dossier?.status === 'submitted';

  const setResponse = (itemId, patch) => {
    const next = { ...responses };
    next[itemId] = { ...(next[itemId] || {}), ...patch };
    setDossier((d) => (d ? { ...d, responses: next } : d));
  };

  const setCompleted = (itemId, completed) => {
    setResponse(itemId, { completed: !!completed });
  };

  const addFileRef = (itemId, fileRef) => {
    const current = responses[itemId]?.fileRefs || [];
    setResponse(itemId, { fileRefs: [...current, fileRef], completed: true });
  };

  const removeFileRef = (itemId, index) => {
    const current = responses[itemId]?.fileRefs || [];
    setResponse(itemId, { fileRefs: current.filter((_, i) => i !== index) });
  };

  const handleUpload = async (itemId, file) => {
    if (!file || !dossier?.id || !currentUser?.uid || !isOwner) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(t('projectDocuments.fileTooBig'));
      return;
    }
    setError('');
    setUploadingFor(itemId);
    try {
      const fileRef = await uploadDossierFile(dossier.id, itemId, file);
      addFileRef(itemId, fileRef);
    } catch (e) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploadingFor(null);
    }
  };

  const handlePickFromProject = (itemId, sectionId, fileRef) => {
    addFileRef(itemId, {
      source: 'generalDossier',
      documentTypeId: sectionId,
      storagePath: fileRef.storagePath,
      name: fileRef.name,
    });
  };

  const handleSave = async () => {
    if (!dossier?.id) return;
    setSaving(true);
    setError('');
    try {
      await updateFinancementDossier(dossier.id, { responses: dossier.responses, status: 'in_progress' });
    } catch (e) {
      setError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!dossier?.id) return;
    setSaving(true);
    setError('');
    try {
      await updateFinancementDossier(dossier.id, {
        responses: dossier.responses,
        status: 'submitted',
        submittedAt: { _seconds: Math.floor(Date.now() / 1000) },
      });
      setDossier((d) => (d ? { ...d, status: 'submitted' } : d));
    } catch (e) {
      setError(e?.message || 'Submit failed');
    } finally {
      setSaving(false);
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

  const generalDocOptions = () => {
    const docs = generalDossier?.documents || {};
    const sectionOrder = Array.isArray(generalDossier?.sectionOrder)
      ? generalDossier.sectionOrder
      : Object.keys(docs);
    const out = [];
    sectionOrder.forEach((sectionId) => {
      const section = docs[sectionId];
      if (!section?.fileRefs) return;
      const title = section.title || section.label || sectionId;
      section.fileRefs.forEach((fileRef, i) => {
        out.push({ documentTypeId: sectionId, title, fileRef, key: `${sectionId}-${i}` });
      });
    });
    return out;
  };

  const showDossierNotFound = dossierLoadDone && (error || dossier === null);
  const showPropertyUnavailable = !property && dossierLoadDone;

  if (showPropertyUnavailable) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <p className="text-red-700 mb-4">{t('financementDossier.propertyUnavailable')}</p>
            {onBack && (
              <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-800 text-sm">
                ← {t('back')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showDossierNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <p className="text-red-700 mb-4">{error || t('financementDossier.notFound')}</p>
            {onBack && (
              <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-800 text-sm">
                ← {t('back')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">
              {t('financementDossier.sectionTitle')} — {dossier?.brokerDisplayName || dossier?.brokerUid || 'Broker'}
            </h2>
            {onBack && (
              <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-800 text-sm">
                ← {t('back')}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <ul className="space-y-4">
            {items.map((item, index) => {
              const itemId = item?.id ?? `item-${index}`;
              const res = responses[itemId] || {};
              const fileRefs = res.fileRefs || [];
              const completed = !!res.completed;
              const isUploading = uploadingFor === itemId;

              return (
                <li
                  key={itemId}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
                >
                  <div className="flex items-start gap-3">
                    {isOwner && !isSubmitted ? (
                      <button
                        type="button"
                        onClick={() => setCompleted(itemId, !completed)}
                        className="shrink-0 mt-0.5 p-0.5 rounded border border-gray-300 bg-white"
                        aria-label={completed ? 'Uncheck' : 'Check'}
                      >
                        <CheckSquare
                          className={`w-5 h-5 ${completed ? 'text-green-600' : 'text-gray-400'}`}
                          fill={completed ? 'currentColor' : 'none'}
                        />
                      </button>
                    ) : (
                      <CheckSquare
                        className={`w-5 h-5 shrink-0 mt-0.5 ${completed ? 'text-green-600' : 'text-gray-400'}`}
                        fill={completed ? 'currentColor' : 'none'}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-800">{item?.label || item?.id || itemId}</span>
                      {item?.requireFile && (
                        <span className="ml-2 text-xs text-gray-500">({t('checklists.requireFile')})</span>
                      )}
                      {item?.requireFile && isOwner && !isSubmitted && (
                        <div className="mt-2 space-y-2">
                          <label className="inline-flex items-center gap-2 px-2 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            {isUploading ? t('projectDocuments.uploading') : t('projectDocuments.upload')}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,image/*"
                              disabled={isUploading}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUpload(itemId, f);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {generalDocOptions().length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-sm text-gray-600">{t('financementDossier.chooseFromProject')}:</span>
                              {generalDocOptions().map(({ key, documentTypeId, title, fileRef }) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handlePickFromProject(itemId, documentTypeId, fileRef)}
                                  className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  {title} — {fileRef.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {fileRefs.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {fileRefs.map((fileRef, idx) => (
                            <li
                              key={fileRef.storagePath || idx}
                              className="flex items-center justify-between gap-2 py-1.5 px-2 bg-white rounded border text-sm"
                            >
                              <span className="truncate text-gray-700">
                                {fileRef.name}
                                {fileRef.source === 'generalDossier' && (
                                  <span className="text-gray-400 ml-1">(Documents du projet)</span>
                                )}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDownload(fileRef)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title={t('projectDocuments.download')}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {isOwner && !isSubmitted && (
                                  <button
                                    type="button"
                                    onClick={() => removeFileRef(itemId, idx)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                  </div>
                </li>
              );
            })}
          </ul>

          {isOwner && !isSubmitted && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {saving ? '…' : t('save')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '…' : t('financementDossier.markSubmitted')}
              </button>
            </div>
          )}

          {isSubmitted && (
            <p className="mt-4 text-sm text-green-700 font-medium">
              {t('financementDossier.status_submitted')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancementDossierPage;
