import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  subscribeChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  setChecklistDefault,
} from '../../services/checklistService';
import { simpleId } from '../../utils/simpleId';
import { ArrowLeft, Plus, Pencil, Trash2, Star, GripVertical } from 'lucide-react';

const ChecklistsPage = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [checklists, setChecklists] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formItems, setFormItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeChecklists(currentUser.uid, setChecklists);
  }, [currentUser?.uid]);

  const startEdit = (c) => {
    setEditingId(c.id);
    setFormName(c.name || '');
    setFormDescription(c.description || '');
    setFormItems((c.items || []).map((it) => ({ ...it, id: it.id || simpleId() })));
  };

  const startAdd = () => {
    setShowAdd(true);
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setFormItems([]);
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowAdd(false);
  };

  const addItem = () => {
    setFormItems((prev) => [...prev, { id: simpleId(), label: '', requireFile: false, order: prev.length }]);
  };

  const updateItem = (idx, field, value) => {
    setFormItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeItem = (idx) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    try {
      const items = formItems
        .filter((it) => (it.label || '').trim())
        .map((it, i) => ({ ...it, order: i }));
      if (editingId) {
        await updateChecklist(currentUser.uid, editingId, {
          name: formName.trim(),
          description: formDescription.trim(),
          items,
        });
        cancelForm();
      } else if (showAdd) {
        await createChecklist(currentUser.uid, {
          name: formName.trim(),
          description: formDescription.trim(),
          items,
          isDefault: checklists.length === 0,
        });
        cancelForm();
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (checklistId) => {
    if (!window.confirm(t('checklists.deleteConfirm'))) return;
    await deleteChecklist(currentUser.uid, checklistId);
  };

  const handleSetDefault = async (checklistId) => {
    await setChecklistDefault(currentUser.uid, checklistId);
  };

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
          <h1 className="text-2xl font-semibold text-gray-800">{t('checklists.title')}</h1>
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            {t('checklists.add')}
          </button>
        </div>

        {(editingId || showAdd) && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
            <h3 className="font-medium mb-4">{editingId ? t('edit') : t('checklists.add')}</h3>
            <div className="space-y-3 mb-4">
              <label className="block">
                <span className="text-sm text-gray-600">{t('checklists.name')}</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                  placeholder={t('checklists.name')}
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">{t('checklists.description')}</span>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                  rows={2}
                />
              </label>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{t('checklists.items')}</span>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + {t('checklists.itemLabel')}
                </button>
              </div>
              <ul className="space-y-2">
                {formItems.map((it, idx) => (
                  <li
                    key={it.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={it.label}
                      onChange={(e) => updateItem(idx, 'label', e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder={t('checklists.itemLabel')}
                    />
                    <label className="flex items-center gap-1 shrink-0 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={!!it.requireFile}
                        onChange={(e) => updateItem(idx, 'requireFile', e.target.checked)}
                      />
                      {t('checklists.requireFile')}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      aria-label={t('projectDocuments.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '…' : t('save')}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {checklists.length === 0 && !showAdd && (
            <p className="text-gray-500">{t('checklists.noChecklists')}</p>
          )}
          {checklists.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{c.name || t('checklists.title')}</span>
                  {c.isDefault && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                      {t('checklists.isDefault')}
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-sm text-gray-500 mt-1 truncate">{c.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {(c.items || []).length} {t('checklists.items').toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!c.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(c.id)}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded"
                    title={t('checklists.setDefault')}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                {!editingId && !showAdd && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      aria-label={t('edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      aria-label={t('clients.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChecklistsPage;
