import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, PaymentStatus } from '../../types';
import { 
  CircleDollarSign, 
  Euro, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Briefcase,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';
import { exportToCSV } from '../../lib/exportUtils';

export const RevenueManager: React.FC = () => {
  const { jobs, expenses, updateJob, setEditingJob, setIsJobModalOpen } = useApp();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = 
        j.clientName.toLowerCase().includes(search.toLowerCase()) ||
        j.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        (j.agency && j.agency.toLowerCase().includes(search.toLowerCase()));

      const matchPayment = paymentFilter === 'all' || j.paymentStatus === paymentFilter;
      return matchSearch && matchPayment;
    }).sort((a, b) => b.shootDate.localeCompare(a.shootDate));
  }, [jobs, search, paymentFilter]);

  // Calcoli Finanziari Precisi
  const totalInvoiced = useMemo(() => {
    return jobs.reduce((sum, j) => sum + j.price, 0);
  }, [jobs]);

  const totalCollected = useMemo(() => {
    return jobs.reduce((sum, j) => sum + (j.price - j.balance), 0);
  }, [jobs]);

  const totalPending = useMemo(() => {
    return jobs.reduce((sum, j) => sum + j.balance, 0);
  }, [jobs]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netProfitOverall = useMemo(() => {
    return totalCollected - totalExpenses;
  }, [totalCollected, totalExpenses]);

  // Azione Rapida: Segna come Saldata
  const handleMarkAsPaid = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    updateJob(job.id, {
      paymentStatus: 'saldato',
      balance: 0,
      paymentDate: todayStr
    });
  };

  const handleExportCSV = () => {
    const data = filteredJobs.map(j => ({
      ID: j.id,
      Data_Servizio: j.shootDate,
      Cliente: j.clientName,
      Agenzia: j.agency || '',
      Immobile: j.propertyAddress,
      Servizio: j.serviceType,
      Prezzo_Totale: j.price,
      Acconto_Incassato: j.deposit,
      Saldo_In_Sospeso: j.balance,
      Incassato_Effettivo: j.price - j.balance,
      Stato_Pagamento: j.paymentStatus,
      Metodo_Pagamento: j.paymentMethod,
      Data_Incasso_Saldo: j.paymentDate || ''
    }));
    exportToCSV(data, `Riepilogo_Incassi_Crediti_${todayStr}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Incassi, Saldi & Controllo Crediti
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Distinzione rigorosa tra fatturato concordato, incassi effettivi in cassa e saldi da ricevere
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Esporta Report Incassi (CSV)</span>
        </button>
      </div>

      {/* 4 BOX FINANZIARI DISTINTI (FATTURATO, INCASSATO, CREDITI, PROFITTO NETTO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Fatturato Totale */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Fatturato Totale
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            € {totalInvoiced.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Valore pattuito di tutti i servizi svolti
          </p>
        </div>

        {/* 2. Incassi Effettivi Ricevuti */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
            Incassi Effettivi in Cassa
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            € {totalCollected.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Acconti e saldi effettivamente intascati
          </p>
        </div>

        {/* 3. Crediti Ancora da Ricevere */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            Crediti da Incassare
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            € {totalPending.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Saldi in attesa di pagamento
          </p>
        </div>

        {/* 4. Guadagno Netto Globale */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
            Guadagno Netto Globale
          </span>
          <p className={`text-2xl sm:text-3xl font-extrabold ${netProfitOverall >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
            € {netProfitOverall.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Incassato (€ {totalCollected.toFixed(0)}) - Spese (€ {totalExpenses.toFixed(0)})
          </p>
        </div>
      </div>

      {/* Ricerca e Filtro Stato Pagamento */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cerca per cliente, agenzia o indirizzo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="w-full sm:w-60 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">Tutti i pagamenti ({jobs.length})</option>
            <option value="in_attesa_acconto">In attesa acconto</option>
            <option value="acconto_ricevuto">Acconto ricevuto</option>
            <option value="in_attesa_saldo">In attesa saldo</option>
            <option value="saldato">Completamente saldati</option>
          </select>
        </div>
      </div>

      {/* Tabella Entrate & Situazione Saldi */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Data</th>
                <th className="p-4">Cliente / Agenzia</th>
                <th className="p-4">Immobile & Servizio</th>
                <th className="p-4">Prezzo Totale</th>
                <th className="p-4">Acconto</th>
                <th className="p-4">Saldo Insoluto</th>
                <th className="p-4">Stato Pagamento</th>
                <th className="p-4 text-right">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Nessun lavoro corrisponde ai filtri di pagamento selezionati.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
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
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{job.clientName}</p>
                      <p className="text-[11px] text-slate-400">{job.agency || 'Privato'}</p>
                    </td>
                    <td className="p-4 min-w-[200px]">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{job.propertyAddress}</p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400">{job.serviceType}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100">
                      € {job.price.toFixed(2)}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                      € {(job.deposit || 0).toFixed(2)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`font-bold ${job.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        € {job.balance.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {job.paymentStatus === 'saldato' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Saldato
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          In attesa saldo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {job.paymentStatus !== 'saldato' ? (
                        <button
                          onClick={(e) => handleMarkAsPaid(job, e)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          Segna Saldato
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Incassato il {job.paymentDate || job.shootDate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
