import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  markInvitationSent,
} from '../../services/clientsService';
import { queueInvitationEmail } from '../../services/invitationEmailService';
import { ArrowLeft, Plus, Pencil, Trash2, Mail } from 'lucide-react';

const ClientsPage = ({ onBack }) => {
  const { currentUser, properties } = useAuth();
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState('');
  const [resendingId, setResendingId] = useState(null);
  const [resendConfirmMessage, setResendConfirmMessage] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = getClients(currentUser.uid, setClients);
    return () => unsub?.();
  }, [currentUser?.uid]);

  const countProperties = (clientId) =>
    (properties || []).filter((p) => p.clientId === clientId).length;

  const handleSaveEdit = async () => {
    if (editingId) {
      await updateClient(editingId, { name: formName, email: formEmail });
      setEditingId(null);
    } else if (showAdd) {
      setSendingInvite(true);
      setLastInviteLink('');
      try {
        const { clientId, invitationLink } = await createClient(currentUser.uid, {
          name: formName,
          email: formEmail,
        });
        const emailTo = (formEmail || '').trim().toLowerCase();
        if (emailTo) {
          try {
            await queueInvitationEmail(currentUser.uid, {
              to: emailTo,
              clientName: formName || undefined,
              invitationLink,
              clientId,
            });
            await markInvitationSent(clientId);
          } catch (e) {
            console.error('Queue invitation email:', e);
            alert(t('clients.inviteQueueError') + ' ' + (e?.message || e));
          }
        }
        setLastInviteLink(invitationLink);
        setFormName('');
        setFormEmail('');
      } finally {
        setSendingInvite(false);
      }
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm(t('clients.deleteConfirm'))) return;
    await deleteClient(clientId);
  };

  const buildInvitationLink = (token) => {
    if (!token || typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}#/signup?invitation=${token}`;
  };

  const handleResendInvitation = async (c) => {
    if (!c.invitationToken || !c.email) return;
    setResendingId(c.id);
    try {
      const invitationLink = buildInvitationLink(c.invitationToken);
      await queueInvitationEmail(currentUser.uid, {
        to: (c.email || '').trim().toLowerCase(),
        clientName: c.name || undefined,
        invitationLink,
        clientId: c.id,
      });
      await markInvitationSent(c.id);
      setResendConfirmMessage(c.name || c.email || c.id);
      setTimeout(() => setResendConfirmMessage(null), 5000);
    } catch (e) {
      console.error('Resend invitation:', e);
      alert(t('clients.inviteQueueError') + ' ' + (e?.message || e));
    } finally {
      setResendingId(null);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setFormName(c.name || '');
    setFormEmail(c.email || '');
    setShowAdd(false);
    setLastInviteLink('');
  };

  const startAdd = () => {
    setShowAdd(true);
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setLastInviteLink('');
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
          <h1 className="text-2xl font-semibold text-gray-800">{t('clients.title')}</h1>
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            {t('clients.add')}
          </button>
        </div>

        {resendConfirmMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 flex items-center justify-between">
            <p className="font-medium">
              {t('clients.invitationResentConfirm')} {resendConfirmMessage}
            </p>
            <button
              type="button"
              onClick={() => setResendConfirmMessage(null)}
              className="text-green-600 hover:text-green-800 text-xl leading-none"
              aria-label={t('cancel')}
            >
              ×
            </button>
          </div>
        )}

        {(showAdd || editingId) && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="font-medium mb-3">
              {editingId ? t('clients.edit') : t('clients.add')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder={t('clients.name')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder={t('clients.email')}
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            {lastInviteLink && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-medium text-green-800 mb-1">{t('clients.inviteLinkCreated')}</p>
                <a href={lastInviteLink} className="text-blue-600 break-all" target="_blank" rel="noopener noreferrer">
                  {lastInviteLink}
                </a>
                <p className="mt-1 text-gray-600">{t('clients.inviteLinkCopy')}</p>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(lastInviteLink); setLastInviteLink(''); }}
                  className="mt-2 text-blue-600 underline"
                >
                  {t('clients.copyLink')}
                </button>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={sendingInvite}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingInvite ? t('clients.sending') : t('save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setShowAdd(false);
                  setLastInviteLink('');
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {clients.length === 0 && !showAdd ? (
            <p className="p-6 text-gray-500 text-center">{t('clients.noClients')}</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((c) => (
                <li key={c.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{c.name || '—'}</p>
                    <p className="text-sm text-gray-500">{c.email || '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('clients.propertiesLinked')}: {countProperties(c.id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.invitationToken && c.email && !c.clientUserId && (
                      <button
                        type="button"
                        onClick={() => handleResendInvitation(c)}
                        disabled={resendingId === c.id}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50"
                        title={t('clients.resendInvitation')}
                        aria-label={t('clients.resendInvitation')}
                      >
                        <Mail size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      aria-label={t('clients.edit')}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      aria-label={t('clients.delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
