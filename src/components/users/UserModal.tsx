import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Camera, 
  Trash2,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { readFileAsDataURL } from '../../lib/photoStorage';

export const UserModal: React.FC = () => {
  const { 
    isUserModalOpen, 
    setIsUserModalOpen, 
    editingUser, 
    setEditingUser, 
    addUser, 
    updateUser, 
    deleteUser 
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'photographer' as UserRole,
    avatarUrl: '',
    color: '#2563eb',
    active: true,
    notes: '',
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        password: '',
        role: editingUser.role,
        avatarUrl: editingUser.avatarUrl || '',
        color: editingUser.color || '#2563eb',
        active: editingUser.active,
        notes: editingUser.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'photographer',
        avatarUrl: '',
        color: '#2563eb',
        active: true,
        notes: '',
      });
    }
  }, [editingUser]);

  if (!isUserModalOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Inserisci il nome e l\'email dell\'utente.');
      return;
    }

    const payload: Partial<AppUser> = { ...formData };
    if (editingUser && !formData.password.trim()) {
      delete payload.password;
    } else if (!editingUser && !formData.password.trim()) {
      payload.password = 'password123';
    }

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      addUser(payload as any);
    }

    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = () => {
    if (editingUser && confirm(`Sei sicuro di voler rimuovere l'utente ${editingUser.name}?`)) {
      deleteUser(editingUser.id);
      setIsUserModalOpen(false);
      setEditingUser(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {editingUser ? 'Modifica Membro Team' : 'Nuovo Utente / Collaboratore'}
            </h2>
            <p className="text-xs text-slate-500">
              Gestione ruoli, contatti e assegnazione incarichi
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingUser && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                title="Rimuovi utente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => {
                setIsUserModalOpen(false);
                setEditingUser(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="relative">
              {formData.avatarUrl ? (
                <img 
                  src={formData.avatarUrl} 
                  alt={formData.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-sm"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : <User className="w-8 h-8" />}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Foto Profilo / Avatar
              </label>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Carica foto</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">Formati JPG, PNG o WebP</p>
            </div>
          </div>

          {/* Dati Anagrafici */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome e Cognome *
              </label>
              <input
                type="text"
                required
                placeholder="Es. Federico Galli"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ruolo Studio *
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Titolare / Amministratore</option>
                <option value="photographer">Fotografo / Operatore</option>
                <option value="editor">Editor / Post-produzione</option>
                <option value="collaborator">Collaboratore / Pilota Drone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="email@studio.it"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefono
              </label>
              <input
                type="tel"
                placeholder="+39 333 ..."
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password di Accesso {editingUser ? '(lascia vuoto per non modificare)' : '*'}
              </label>
              <input
                type="password"
                required={!editingUser}
                placeholder={editingUser ? '•••••••• (invariata)' : 'Almeno 6 caratteri (es. password123)'}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Colore distintivo badge */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Colore Badge
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-500">{formData.color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stato Account
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Attivo nel team</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note, Competenze & Attrezzatura in Dotazione
            </label>
            <textarea
              rows={2}
              placeholder="Es. Specializzato in virtual tour Matterport, pilota drone con patentino A1/A3, fotocamera Sony A7IV..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsUserModalOpen(false);
                setEditingUser(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/30 transition-all"
            >
              {editingUser ? 'Salva Utente' : 'Crea Utente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
