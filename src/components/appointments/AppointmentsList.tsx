import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus, ServiceType } from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  PhoneCall, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Trash2,
  CheckCircle2,
  Home
} from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';

export const AppointmentsList: React.FC = () => {
  const { 
    appointments, 
    setIsAppointmentModalOpen, 
    setEditingAppointment, 
    duplicateAppointment, 
    deleteAppointment 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('asc');

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchSearch = 
        apt.clientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        (apt.agency && apt.agency.toLowerCase().includes(search.toLowerCase())) ||
        apt.phone.includes(search);

      const matchStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchService = serviceFilter === 'all' || apt.serviceType === serviceFilter;

      return matchSearch && matchStatus && matchService;
    }).sort((a, b) => {
      if (dateSort === 'asc') return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
    });
  }, [appointments, search, statusFilter, serviceFilter, dateSort]);

  const handleExportCSV = () => {
    const data = filteredAppointments.map(a => ({
      ID: a.id,
      Data: a.date,
      Orario: a.time,
      Cliente: a.clientName,
      Agenzia: a.agency || '',
      Telefono: a.phone,
      Email: a.email,
      Indirizzo: a.propertyAddress,
      Tipologia: a.propertyType,
      Metratura: a.squareMeters,
      Stanze: a.rooms,
      Servizio: a.serviceType,
      Prezzo: a.agreedPrice,
      Acconto: a.deposit || 0,
      Stato: a.status,
      Note: a.notes || '',
      Richieste_Speciali: a.specialRequests || ''
    }));
    exportToCSV(data, `Appuntamenti_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confermato':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Confermato</span>;
      case 'in_attesa':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">In attesa</span>;
      case 'annullato':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Annullato</span>;
      case 'completato':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Completato</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tutti gli Appuntamenti ({filteredAppointments.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Prenotazioni, sopralluoghi fotografici e riprese video in programma
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Appuntamento</span>
          </button>
        </div>
      </div>

      {/* Filtri & Ricerca */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cerca cliente, via, agenzia..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
          >
            <option value="all">Tutti gli stati</option>
            <option value="confermato">Confermato</option>
            <option value="in_attesa">In attesa</option>
            <option value="annullato">Annullato</option>
            <option value="completato">Completato</option>
          </select>
        </div>

        <div>
          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
          >
            <option value="all">Tutti i servizi</option>
            <option value="Servizio fotografico">Servizio fotografico</option>
            <option value="Fotografia + video">Fotografia + video</option>
            <option value="Video immobiliare">Video immobiliare</option>
            <option value="Foto + video + drone">Foto + video + drone</option>
            <option value="Virtual tour">Virtual tour</option>
            <option value="Servizio personalizzato">Servizio personalizzato</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center justify-between"
          >
            <span>Ordinamento Data</span>
            <span className="font-semibold text-blue-600">
              {dateSort === 'asc' ? 'Crescente ↑' : 'Decrescente ↓'}
            </span>
          </button>
        </div>
      </div>

      {/* Grid Cards / List */}
      {filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Nessun appuntamento trovato
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Modifica i filtri di ricerca o crea una nuova prenotazione.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map(apt => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.propertyAddress)}`;
            return (
              <div
                key={apt.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Date & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span>{apt.date} • {apt.time}</span>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  {/* Indirizzo Immobile */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug mb-1">
                    {apt.propertyAddress}
                  </h3>

                  {/* Metratura e tipologia */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                      {apt.propertyType}
                    </span>
                    <span>•</span>
                    <span>{apt.squareMeters} m²</span>
                    <span>•</span>
                    <span>{apt.rooms} {apt.rooms === 1 ? 'stanza' : 'stanze'}</span>
                  </div>

                  {/* Committente & Agenzia */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.clientName}</span>
                      <span className="text-slate-400 font-medium">{apt.agency || 'Privato'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{apt.phone}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">€ {apt.agreedPrice}</span>
                    </div>
                  </div>

                  {/* Servizio & Richieste particolari */}
                  <div className="text-xs space-y-1 mb-4">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      Servizio: {apt.serviceType}
                    </p>
                    {apt.specialRequests && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                        ★ {apt.specialRequests}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${apt.phone}`}
                      title="Chiama cliente"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-blue-600" />
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Naviga con Google Maps"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </a>
                    <button
                      onClick={() => duplicateAppointment(apt.id)}
                      title="Duplica tra 7 giorni"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAppointment(apt);
                        setIsAppointmentModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
