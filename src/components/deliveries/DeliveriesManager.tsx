import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryItem, DeliveryStatus } from '../../types';
import { DELIVERY_STATUS_LABELS } from './DeliveryModal';
import { 
  PackageCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  FolderDown, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  Download,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';

export const DeliveriesManager: React.FC = () => {
  const { 
    deliveries, 
    updateDelivery, 
    setEditingDelivery, 
    setIsDeliveryModalOpen 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchSearch = 
        d.clientName.toLowerCase().includes(search.toLowerCase()) ||
        d.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        (d.agency && d.agency.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => a.targetDeliveryDate.localeCompare(b.targetDeliveryDate));
  }, [deliveries, search, statusFilter]);

  // Alert metriche
  const overdueDeliveries = useMemo(() => {
    return deliveries.filter(d => 
      d.status !== 'consegnato' && 
      d.status !== 'nuova_consegna_effettuata' && 
      d.targetDeliveryDate < todayStr
    );
  }, [deliveries, todayStr]);

  const dueSoonDeliveries = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return deliveries.filter(d => 
      d.status !== 'consegnato' && 
      d.status !== 'nuova_consegna_effettuata' && 
      (d.targetDeliveryDate === todayStr || d.targetDeliveryDate === tomorrowStr)
    );
  }, [deliveries, todayStr]);

  const handleMarkAsDelivered = (item: DeliveryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    updateDelivery(item.id, {
      status: 'consegnato',
      actualDeliveryDate: todayStr
    });
  };

  const handleExportCSV = () => {
    const data = filteredDeliveries.map(d => ({
      ID: d.id,
      Cliente: d.clientName,
      Agenzia: d.agency || '',
      Indirizzo: d.propertyAddress,
      Data_Servizio: d.shootDate,
      Data_Prevista: d.targetDeliveryDate,
      Data_Effettiva: d.actualDeliveryDate || '',
      Materiale: d.materialDelivered,
      Stato: d.status,
      Link_Cloud: d.cloudFolderUrl || '',
      Note: d.notes || ''
    }));
    exportToCSV(data, `Consegne_ImmoPhoto_${todayStr}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Gestione Consegne Materiale ({filteredDeliveries.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Controllo scadenze, cartelle Google Drive/Dropbox e approvazioni clienti
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
              setEditingDelivery(null);
              setIsDeliveryModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Consegna</span>
          </button>
        </div>
      </div>

      {/* AVVISI SCADENZE E RITARDI */}
      {(overdueDeliveries.length > 0 || dueSoonDeliveries.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {overdueDeliveries.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-900 dark:text-red-200">
                  {overdueDeliveries.length} {overdueDeliveries.length === 1 ? 'consegna in ritardo' : 'consegne in ritardo'}!
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  La data di scadenza concordata con il cliente è stata superata.
                </p>
              </div>
            </div>
          )}

          {dueSoonDeliveries.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  {dueSoonDeliveries.length} {dueSoonDeliveries.length === 1 ? 'consegna in scadenza' : 'consegne in scadenza'} (Oggi / Domani)
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Completa l'editing e invia il link al committente.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtri & Ricerca */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cerca cliente, agenzia o immobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-60 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">Tutti gli stati ({deliveries.length})</option>
            <option value="da_preparare">Da preparare</option>
            <option value="in_lavorazione">In lavorazione</option>
            <option value="pronto">Pronto</option>
            <option value="consegnato">Consegnato</option>
            <option value="in_attesa_modifiche">In attesa modifiche</option>
            <option value="modifiche_richieste">Modifiche richieste</option>
            <option value="nuova_consegna_effettuata">Nuova consegna effettuata</option>
          </select>
        </div>
      </div>

      {/* Grid Consegne */}
      {filteredDeliveries.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <PackageCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Nessuna consegna trovata
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Modifica i filtri o aggiungi una consegna per i tuoi servizi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map(item => {
            const statusConf = DELIVERY_STATUS_LABELS[item.status] || { label: item.status, badge: 'bg-slate-100 text-slate-700' };
            const isLate = item.status !== 'consegnato' && item.status !== 'nuova_consegna_effettuata' && item.targetDeliveryDate < todayStr;
            const isDueToday = item.status !== 'consegnato' && item.targetDeliveryDate === todayStr;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setEditingDelivery(item);
                  setIsDeliveryModalOpen(true);
                }}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-subtle hover:shadow-premium cursor-pointer transition-all flex flex-col justify-between ${
                  isLate 
                    ? 'border-red-300 dark:border-red-900/60' 
                    : isDueToday 
                    ? 'border-amber-300 dark:border-amber-900/60' 
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Status & Deadline Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusConf.badge}`}>
                      {statusConf.label}
                    </span>

                    {isLate ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-[10px] font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> SCADUTA
                      </span>
                    ) : isDueToday ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold">
                        OGGI
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Scadenza: {item.targetDeliveryDate}
                      </span>
                    )}
                  </div>

                  {/* Indirizzo Immobile */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug mb-1">
                    {item.propertyAddress}
                  </h3>

                  {/* Cliente / Agenzia */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 truncate">
                    {item.clientName} {item.agency ? `• ${item.agency}` : ''}
                  </p>

                  {/* Dettagli Date e Materiale */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 mb-3 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Data Servizio:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.shootDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Data Prevista:</span>
                      <span className={`font-bold ${isLate ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.targetDeliveryDate}
                      </span>
                    </div>
                    {item.actualDeliveryDate && (
                      <div className="flex items-center justify-between text-emerald-600 font-semibold">
                        <span>Consegnato il:</span>
                        <span>{item.actualDeliveryDate}</span>
                      </div>
                    )}
                    <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
                      Materiale: <span className="font-semibold">{item.materialDelivered}</span>
                    </div>
                  </div>

                  {/* Link Cartella Cloud */}
                  {item.cloudFolderUrl ? (
                    <div className="mb-3">
                      <a
                        href={item.cloudFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-between transition-colors border border-blue-100 dark:border-blue-900/50"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FolderDown className="w-4 h-4 shrink-0" />
                          <span className="truncate">Apri Cartella Drive / Dropbox</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic mb-3">
                      Nessun link cloud inserito
                    </p>
                  )}
                </div>

                {/* Bottom Action: Segna come Consegnato */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {item.status !== 'consegnato' ? (
                    <button
                      onClick={(e) => handleMarkAsDelivered(item, e)}
                      className="w-full py-2 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-teal-200 dark:border-teal-800/60 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Segna Consegnato Oggi</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Consegna completata</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
