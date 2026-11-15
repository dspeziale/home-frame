import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  PhoneCall, 
  Trash2,
  Euro,
  Briefcase,
  Calendar
} from 'lucide-react';

export const ClientModal: React.FC = () => {
  const { 
    isClientModalOpen, 
    setIsClientModalOpen, 
    editingClient, 
    setEditingClient, 
    addClient, 
    updateClient, 
    deleteClient,
    jobs,
    appointments 
  } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    agency: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (editingClient) {
      setFormData({
        fullName: editingClient.fullName,
        agency: editingClient.agency || '',
        phone: editingClient.phone,
        email: editingClient.email,
        address: editingClient.address || '',
        notes: editingClient.notes || '',
      });
    } else {
      setFormData({
        fullName: '',
        agency: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
  }, [editingClient]);

  if (!isClientModalOpen) return null;

  // Calcola statistiche per questo cliente
  const clientJobs = editingClient 
    ? jobs.filter(j => j.clientId === editingClient.id || j.clientName.toLowerCase() === editingClient.fullName.toLowerCase())
    : [];

  const clientAppointments = editingClient
    ? appointments.filter(a => a.clientId === editingClient.id || a.clientName.toLowerCase() === editingClient.fullName.toLowerCase())
    : [];

  const totalBilled = clientJobs.reduce((sum, j) => sum + j.price, 0);
  const totalReceived = clientJobs.reduce((sum, j) => sum + (j.price - j.balance), 0);
  const totalPending = clientJobs.reduce((sum, j) => sum + j.balance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Inserisci il nome del cliente e il numero di telefono.');
      return;
    }

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }

    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDelete = () => {
    if (editingClient && confirm(`Eliminare il cliente ${editingClient.fullName}?`)) {
      deleteClient(editingClient.id);
      setIsClientModalOpen(false);
      setEditingClient(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              {editingClient ? 'Scheda Cliente & Agenzia' : 'Nuovo Cliente'}
            </h2>
            <p className="text-xs text-slate-500">
              Anagrafica, storico commesse e situazione pagamenti
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingClient && (
              <button
                type="button"
                onClick={handleDelete}
                title="Elimina cliente"
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => {
                setIsClientModalOpen(false);
                setEditingClient(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Se in modifica, mostra il sommario contabile del cliente */}
          {editingClient && (
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Totale Fatturato</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  € {totalBilled.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Incassato Effettivo</p>
                <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  € {totalReceived.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Da Ricevere</p>
                <p className={`text-base sm:text-lg font-bold ${totalPending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                  € {totalPending.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Dati Anagrafici */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome e Cognome / Referente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Es. Mario Rossi"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenzia Immobiliare
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Es. Tecnocasa / Remax"
                  value={formData.agency}
                  onChange={e => setFormData({ ...formData, agency: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Telefono *</span>
                {formData.phone && (
                  <a href={`tel:${formData.phone}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]">
                    <PhoneCall className="w-3 h-3" /> Chiama
                  </a>
                )}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+39 347 ..."
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="mario@agenzia.it"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Indirizzo Sede / Agenzia
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Via / Piazza, Città"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note, Preferenze di Scatto & Convenzioni
            </label>
            <textarea
              rows={2}
              placeholder="Preferenze specifiche dell'agenzia, orari di disponibilità, listino concordato..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Storico Lavori svolti per questo cliente */}
          {editingClient && clientJobs.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Storico Lavori ({clientJobs.length})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {clientJobs.map(job => (
                  <div key={job.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{job.propertyAddress}</p>
                      <p className="text-slate-400">{job.shootDate} • {job.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-200">€ {job.price.toFixed(2)}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        job.paymentStatus === 'saldato' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {job.paymentStatus === 'saldato' ? 'Saldato' : `In attesa € ${job.balance.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsClientModalOpen(false);
                setEditingClient(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-md shadow-purple-600/30 transition-all"
            >
              {editingClient ? 'Salva Modifiche' : 'Crea Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
