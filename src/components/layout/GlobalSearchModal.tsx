import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MapPin, User, Briefcase, Calendar, X, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    clients, 
    appointments, 
    jobs, 
    setActiveTab, 
    setEditingJob, 
    setIsJobModalOpen,
    setEditingAppointment,
    setIsAppointmentModalOpen,
    setEditingClient,
    setIsClientModalOpen
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { clients: [], appointments: [], jobs: [] };

    const matchedClients = clients.filter(c => 
      c.fullName.toLowerCase().includes(q) ||
      (c.agency && c.agency.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedAppointments = appointments.filter(a => 
      a.clientName.toLowerCase().includes(q) ||
      a.propertyAddress.toLowerCase().includes(q) ||
      (a.agency && a.agency.toLowerCase().includes(q)) ||
      a.serviceType.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedJobs = jobs.filter(j => 
      j.clientName.toLowerCase().includes(q) ||
      j.propertyAddress.toLowerCase().includes(q) ||
      (j.agency && j.agency.toLowerCase().includes(q)) ||
      j.serviceType.toLowerCase().includes(q)
    ).slice(0, 5);

    return { clients: matchedClients, appointments: matchedAppointments, jobs: matchedJobs };
  }, [query, clients, appointments, jobs]);

  if (!isSearchOpen) return null;

  const totalResults = results.clients.length + results.appointments.length + results.jobs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-float border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cerca per cliente, agenzia, indirizzo immobile, servizio..."
            className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query && totalResults === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nessun risultato trovato per "{query}"
            </div>
          )}

          {!query && (
            <div className="text-center py-6 text-slate-400 text-sm">
              Digita per cercare tra clienti, appuntamenti e schede lavoro...
            </div>
          )}

          {/* Lavori */}
          {results.jobs.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Schede Lavoro ({results.jobs.length})
              </p>
              <div className="space-y-1">
                {results.jobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => {
                      setEditingJob(job);
                      setIsJobModalOpen(true);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {job.propertyAddress}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {job.clientName} {job.agency ? `• ${job.agency}` : ''} • {job.serviceType}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appuntamenti */}
          {results.appointments.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Appuntamenti ({results.appointments.length})
              </p>
              <div className="space-y-1">
                {results.appointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setEditingAppointment(apt);
                      setIsAppointmentModalOpen(true);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {apt.date} ore {apt.time} - {apt.propertyAddress}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {apt.clientName} {apt.agency ? `• ${apt.agency}` : ''} • {apt.serviceType}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clienti */}
          {results.clients.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Clienti & Agenzie ({results.clients.length})
              </p>
              <div className="space-y-1">
                {results.clients.map(cli => (
                  <div
                    key={cli.id}
                    onClick={() => {
                      setEditingClient(cli);
                      setIsClientModalOpen(true);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {cli.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {cli.agency || 'Privato'} • {cli.phone} • {cli.email || 'Nessuna email'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
