import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, JobStatus } from '../../types';
import { JOB_STATUS_LABELS } from './JobModal';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  FolderDown, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  PhoneCall, 
  Printer, 
  ChevronRight,
  ArrowRight,
  Columns,
  List,
  Camera,
  Video,
  Euro
} from 'lucide-react';
import { generateJobPDF } from '../../lib/exportUtils';

export const JobsBoard: React.FC = () => {
  const { 
    jobs, 
    updateJobStatus, 
    setEditingJob, 
    setIsJobModalOpen, 
    businessProfile,
    users,
    setPhotoGalleryJob 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = 
        j.clientName.toLowerCase().includes(search.toLowerCase()) ||
        j.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        (j.agency && j.agency.toLowerCase().includes(search.toLowerCase())) ||
        j.serviceType.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatusFilter === 'all' || j.status === selectedStatusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => b.shootDate.localeCompare(a.shootDate));
  }, [jobs, search, selectedStatusFilter]);

  const allStatuses: JobStatus[] = [
    '1_confermato',
    '2_da_effettuare',
    '3_effettuato',
    '4_selezione',
    '5_editing',
    '6_pronto',
    '7_consegnato',
    '8_completato_pagato'
  ];

  // Passa al prossimo stato
  const handleAdvanceStatus = (job: Job) => {
    const currentIndex = allStatuses.indexOf(job.status);
    if (currentIndex < allStatuses.length - 1) {
      updateJobStatus(job.id, allStatuses[currentIndex + 1]);
    }
  };

  const handlePrintPDF = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    generateJobPDF(businessProfile, job);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Schede Lavoro & Produzione ({filteredJobs.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pipeline completa: riprese, selezione scatti, editing, consegna e saldo
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Kanban vs Lista */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Vista Kanban a colonne"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Vista Elenco ordinato"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabella</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingJob(null);
              setIsJobModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Lavoro</span>
          </button>
        </div>
      </div>

      {/* Ricerca e Filtro */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cerca cliente, immobile, agenzia o servizio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-64 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">Tutte le fasi ({jobs.length})</option>
            {allStatuses.map(st => (
              <option key={st} value={st}>
                {JOB_STATUS_LABELS[st].label} ({jobs.filter(j => j.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VISTA 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1300px]">
            {allStatuses.map(statusKey => {
              const statusConf = JOB_STATUS_LABELS[statusKey];
              const columnJobs = filteredJobs.filter(j => j.status === statusKey);

              return (
                <div 
                  key={statusKey}
                  className="w-80 shrink-0 bg-slate-100/60 dark:bg-slate-900/60 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 px-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Fase {statusConf.step}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {statusConf.label.replace(/^\d+\.\s*/, '')}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-2xs border border-slate-200/60 dark:border-slate-700">
                      {columnJobs.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-1">
                    {columnJobs.length === 0 ? (
                      <div className="p-6 text-center text-[11px] text-slate-400 italic">
                        Nessun lavoro in questa fase
                      </div>
                    ) : (
                      columnJobs.map(job => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.propertyAddress)}`;
                        return (
                          <div
                            key={job.id}
                            onClick={() => {
                              setEditingJob(job);
                              setIsJobModalOpen(true);
                            }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-subtle hover:border-blue-400 cursor-pointer transition-all space-y-2.5"
                          >
                            {/* Cover Thumbnail if exists */}
                            {job.coverPhotoUrl && (
                              <div className="relative rounded-xl overflow-hidden h-28 w-full group/img">
                                <img 
                                  src={job.coverPhotoUrl} 
                                  alt={job.propertyAddress} 
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPhotoGalleryJob(job);
                                  }}
                                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-blue-600 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 transition-colors"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>Foto & Video</span>
                                </button>
                              </div>
                            )}

                            {/* Date & Service Badge */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {job.shootDate}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                                {job.serviceType}
                              </span>
                            </div>

                            {/* Property Address */}
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                              {job.propertyAddress}
                            </h5>

                            {/* Client & Agency */}
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                              {job.clientName} {job.agency ? `• ${job.agency}` : ''}
                            </p>

                            {/* Assigned Team Member */}
                            {job.assignedPhotographerId && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Fotografo: {users.find(u => u.id === job.assignedPhotographerId)?.name || 'Assegnato'}</span>
                              </div>
                            )}

                            {/* Materiale & Scadenza */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span className="flex items-center gap-1">
                                <Camera className="w-3 h-3 text-slate-400" /> {job.expectedPhotos} foto
                                {job.expectedVideos > 0 && ` + ${job.expectedVideos} vid.`}
                              </span>
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                Scad. {job.targetDeliveryDate}
                              </span>
                            </div>

                            {/* Link Drive & Photo Gallery Button */}
                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPhotoGalleryJob(job);
                                }}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Foto & Video</span>
                              </button>

                              <button
                                onClick={(e) => handlePrintPDF(job, e)}
                                title="Esporta Scheda PDF"
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Advance Status Button */}
                            {statusConf.step < 8 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStatus(job);
                                }}
                                className="w-full mt-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>Avanza alla fase {statusConf.step + 1}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: LISTA DETTAGLIATA */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Data Servizio</th>
                  <th className="p-4">Immobile & Indirizzo</th>
                  <th className="p-4">Cliente / Agenzia</th>
                  <th className="p-4">Servizio & Materiale</th>
                  <th className="p-4">Fase Lavorazione</th>
                  <th className="p-4">Scadenza Consegna</th>
                  <th className="p-4">Prezzo / Saldo</th>
                  <th className="p-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.map(job => {
                  const statusConf = JOB_STATUS_LABELS[job.status];
                  return (
                    <tr
                      key={job.id}
                      onClick={() => {
                        setEditingJob(job);
                        setIsJobModalOpen(true);
                      }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {job.shootDate}
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{job.propertyAddress}</p>
                        <p className="text-[11px] text-slate-400">{job.propertyType}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{job.clientName}</p>
                        <p className="text-[11px] text-slate-400">{job.agency || 'Privato'} • {job.phone}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-semibold text-blue-600 dark:text-blue-400">{job.serviceType}</p>
                        <p className="text-[11px] text-slate-400">{job.expectedPhotos} foto {job.expectedVideos > 0 ? `+ ${job.expectedVideos} video` : ''}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConf.badgeBg}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                        {job.targetDeliveryDate}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 dark:text-slate-100">€ {job.price.toFixed(2)}</p>
                        <p className={`text-[11px] font-semibold ${job.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {job.balance > 0 ? `Saldo € ${job.balance.toFixed(2)}` : 'Saldato'}
                        </p>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {job.cloudFolderUrl && (
                            <a
                              href={job.cloudFolderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              title="Apri Drive/Dropbox"
                            >
                              <FolderDown className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={(e) => handlePrintPDF(job, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Stampa Scheda PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
