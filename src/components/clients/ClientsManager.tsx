import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Search, 
  Download, 
  PhoneCall, 
  Euro, 
  Briefcase, 
  Calendar,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';

export const ClientsManager: React.FC = () => {
  const { 
    clients, 
    jobs, 
    appointments, 
    setIsClientModalOpen, 
    setEditingClient, 
    deleteClient,
    setEditingJob,
    setIsJobModalOpen 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = 
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (c.agency && c.agency.toLowerCase().includes(search.toLowerCase())) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [clients, search]);

  const handleExportCSV = () => {
    const data = filteredClients.map(c => {
      const cJobs = jobs.filter(j => j.clientId === c.id || j.clientName.toLowerCase() === c.fullName.toLowerCase());
      const billed = cJobs.reduce((s, j) => s + j.price, 0);
      const pending = cJobs.reduce((s, j) => s + j.balance, 0);

      return {
        ID: c.id,
        Nome: c.fullName,
        Agenzia: c.agency || '',
        Telefono: c.phone,
        Email: c.email || '',
        Indirizzo: c.address || '',
        Totale_Lavori: cJobs.length,
        Fatturato_Totale: billed,
        Crediti_Insoluti: pending,
        Note: c.notes || ''
      };
    });
    exportToCSV(data, `Anagrafica_Clienti_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Archivio Clienti & Agenzie ({filteredClients.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Anagrafica committenti, contatti veloci e storico fatturato per singolo cliente
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta Clienti (CSV)</span>
          </button>
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Cliente</span>
          </button>
        </div>
      </div>

      {/* Ricerca Rapida */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-6.5" />
        <input
          type="text"
          placeholder="Cerca per nome, agenzia, telefono o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Grid Clienti */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Nessun cliente trovato
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Aggiungi un nuovo contatto o prova con una ricerca diversa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const clientJobs = jobs.filter(j => 
              j.clientId === client.id || 
              j.clientName.toLowerCase() === client.fullName.toLowerCase()
            );
            const clientAppointments = appointments.filter(a => 
              a.clientId === client.id || 
              a.clientName.toLowerCase() === client.fullName.toLowerCase()
            );

            const totalBilled = clientJobs.reduce((sum, j) => sum + j.price, 0);
            const totalPending = clientJobs.reduce((sum, j) => sum + j.balance, 0);
            const totalReceived = totalBilled - totalPending;

            return (
              <div
                key={client.id}
                onClick={() => {
                  setEditingClient(client);
                  setIsClientModalOpen(true);
                }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-premium cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Avatar & Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-200 dark:border-purple-800">
                        {client.fullName.split(' ').map(n => n[0]).join('') || 'CL'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                          {client.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {client.agency || 'Cliente Privato'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recapiti */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </span>
                      <a
                        href={`tel:${client.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-[11px] hover:bg-blue-100"
                      >
                        Chiama
                      </a>
                    </div>

                    {client.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-center gap-1.5 truncate text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Situazione Contabile Cliente */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lavori</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{clientJobs.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fatturato</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">€ {totalBilled.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Da Pagare</span>
                      <span className={`font-bold ${totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        € {totalPending.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Storico Preview */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{clientAppointments.length} Appuntamenti</span>
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setIsClientModalOpen(true);
                    }}
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Vedi Scheda Completa →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
