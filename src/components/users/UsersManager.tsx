import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Camera, 
  Video, 
  Briefcase, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string }> = {
  admin: { label: 'Titolare / Admin', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  photographer: { label: 'Fotografo', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  editor: { label: 'Editor Video / Foto', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  collaborator: { label: 'Collaboratore', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
};

export const UsersManager: React.FC = () => {
  const { 
    users, 
    currentUserId, 
    setCurrentUserId, 
    setIsUserModalOpen, 
    setEditingUser,
    jobs,
    appointments 
  } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Gestione Utenti & Team ({users.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Fotografi, editor video, collaboratori esterni e titolari dello studio
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setIsUserModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuovo Utente</span>
        </button>
      </div>

      {/* Switcher Utente Attivo Corrente */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sessione Operatore Attiva
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Stai operando come: <span className="text-blue-600">{users.find(u => u.id === currentUserId)?.name || 'Utente'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Cambia operatore:</label>
          <select
            value={currentUserId}
            onChange={e => setCurrentUserId(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({ROLE_LABELS[u.role].label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Schede Utenti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map(user => {
          const roleConf = ROLE_LABELS[user.role];
          const isCurrent = user.id === currentUserId;

          // Lavori e appuntamenti assegnati a questo utente
          const assignedJobs = jobs.filter(j => 
            j.assignedPhotographerId === user.id || j.assignedEditorId === user.id
          );
          const assignedAppointments = appointments.filter(a => 
            a.assignedUserId === user.id
          );

          return (
            <div
              key={user.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between ${
                isCurrent ? 'ring-2 ring-blue-500/30 border-blue-400' : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div 
                        className="w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm text-sm"
                        style={{ backgroundColor: user.color || '#2563eb' }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {user.name}
                        </h3>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Utente corrente"></span>
                        )}
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${roleConf.badge}`}>
                        {roleConf.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setIsUserModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Modifica utente"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Recapiti */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Note / Attrezzatura */}
                {user.notes && (
                  <p className="text-[11px] text-slate-500 italic p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-4 line-clamp-2">
                    {user.notes}
                  </p>
                )}

                {/* Statistiche Lavori Assegnati */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Incarichi Lavoro</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{assignedJobs.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Appuntamenti</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{assignedAppointments.length}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Imposta come operatore attivo */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {!isCurrent ? (
                  <button
                    onClick={() => setCurrentUserId(user.id)}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Imposta come operatore attivo</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Operatore Attivo</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
