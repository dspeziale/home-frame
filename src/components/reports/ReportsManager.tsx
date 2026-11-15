import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Camera, 
  Video, 
  Users, 
  PieChart as PieChartIcon,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { exportToCSV, generatePDFReport } from '../../lib/exportUtils';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export const ReportsManager: React.FC = () => {
  const { jobs, expenses, clients, businessProfile } = useApp();

  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calcola intervallo date in base al periodo selezionato
  const { startDateStr, endDateStr, periodLabel } = useMemo(() => {
    if (period === 'daily') {
      return { startDateStr: todayStr, endDateStr: todayStr, periodLabel: `Giornata del ${todayStr}` };
    }
    if (period === 'weekly') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      const start = d.toISOString().split('T')[0];
      const endD = new Date(d);
      endD.setDate(endD.getDate() + 6);
      const end = endD.toISOString().split('T')[0];
      return { startDateStr: start, endDateStr: end, periodLabel: `Settimana (${start} / ${end})` };
    }
    if (period === 'monthly') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${y}-${m}-01`;
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      const end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      return { startDateStr: start, endDateStr: end, periodLabel: `Mese di ${now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}` };
    }
    if (period === 'yearly') {
      const y = now.getFullYear();
      return { startDateStr: `${y}-01-01`, endDateStr: `${y}-12-31`, periodLabel: `Anno ${y}` };
    }
    return { startDateStr: customStartDate, endDateStr: customEndDate, periodLabel: `Periodo Personalizzato (${customStartDate} / ${customEndDate})` };
  }, [period, customStartDate, customEndDate, todayStr]);

  // Filtra Lavori e Spese nel periodo
  const periodJobs = useMemo(() => {
    return jobs.filter(j => j.shootDate >= startDateStr && j.shootDate <= endDateStr);
  }, [jobs, startDateStr, endDateStr]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => e.date >= startDateStr && e.date <= endDateStr);
  }, [expenses, startDateStr, endDateStr]);

  // Metriche del periodo
  const totalRevenue = useMemo(() => {
    return periodJobs.reduce((sum, j) => sum + j.price, 0);
  }, [periodJobs]);

  const totalCollected = useMemo(() => {
    return periodJobs.reduce((sum, j) => sum + (j.price - j.balance), 0);
  }, [periodJobs]);

  const totalPending = useMemo(() => {
    return periodJobs.reduce((sum, j) => sum + j.balance, 0);
  }, [periodJobs]);

  const totalExpenses = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [periodExpenses]);

  const netProfit = useMemo(() => {
    return totalCollected - totalExpenses;
  }, [totalCollected, totalExpenses]);

  const totalShoots = periodJobs.length;
  const totalVideos = periodJobs.reduce((sum, j) => sum + (j.expectedVideos || 0), 0);
  const totalPhotos = periodJobs.reduce((sum, j) => sum + (j.expectedPhotos || 0), 0);

  // Clienti più attivi
  const topClients = useMemo(() => {
    const clientMap: Record<string, { name: string; agency: string; count: number; total: number }> = {};
    periodJobs.forEach(j => {
      if (!clientMap[j.clientName]) {
        clientMap[j.clientName] = { name: j.clientName, agency: j.agency || 'Privato', count: 0, total: 0 };
      }
      clientMap[j.clientName].count += 1;
      clientMap[j.clientName].total += j.price;
    });
    return Object.values(clientMap).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [periodJobs]);

  // Servizi più richiesti
  const topServices = useMemo(() => {
    const serviceMap: Record<string, number> = {};
    periodJobs.forEach(j => {
      serviceMap[j.serviceType] = (serviceMap[j.serviceType] || 0) + 1;
    });
    return Object.entries(serviceMap).map(([name, count]) => ({ name, count }));
  }, [periodJobs]);

  const handleExportPDF = () => {
    generatePDFReport(
      businessProfile,
      periodLabel,
      {
        totalRevenue,
        totalCollected,
        totalPending,
        totalExpenses,
        netProfit,
        totalShoots,
        totalVideos
      },
      periodJobs,
      periodExpenses
    );
  };

  const handleExportCSV = () => {
    const summaryRows = [
      { Metrica: 'Periodo', Valore: periodLabel },
      { Metrica: 'Fatturato Totale', Valore: totalRevenue },
      { Metrica: 'Incassi Effettivi Ricevuti', Valore: totalCollected },
      { Metrica: 'Crediti da Incassare', Valore: totalPending },
      { Metrica: 'Spese Totali', Valore: totalExpenses },
      { Metrica: 'Guadagno Netto', Valore: netProfit },
      { Metrica: 'Totale Immobili Fotografati', Valore: totalShoots },
      { Metrica: 'Totale Video Prodotti', Valore: totalVideos },
      { Metrica: 'Totale Fotografie Scattate', Valore: totalPhotos }
    ];
    exportToCSV(summaryRows, `Report_Statistiche_${todayStr}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Statistiche, Analisi & Report Economici
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Performance di produzione fotografica, redditività e rendiconto
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
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Genera Report PDF</span>
          </button>
        </div>
      </div>

      {/* FILTRI TEMPORALI: GIORNALIERO, SETTIMANALE, MENSILE, ANNUALE, PERSONALIZZATO */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-xl transition-all ${period === 'daily' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Oggi
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-xl transition-all ${period === 'weekly' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Settimanale
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-xl transition-all ${period === 'monthly' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Mensile
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-3 py-1.5 rounded-xl transition-all ${period === 'yearly' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Annuale
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-xl transition-all ${period === 'custom' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Personalizzato
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
            <span className="text-slate-400">fino a</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>
        )}

        <div className="text-xs font-semibold text-slate-500">
          {periodLabel}
        </div>
      </div>

      {/* METRICHE CHIAVE DEL PERIODO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Fatturato Periodo</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">€ {totalRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Totale incarichi svolti</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Incassato Effettivo</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">€ {totalCollected.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">In cassa</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-semibold text-amber-500 block mb-1">Spese del Periodo</span>
          <p className="text-2xl font-extrabold text-amber-500">€ {totalExpenses.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Costi operativi sostenuti</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">Guadagno Netto</span>
          <p className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
            € {netProfit.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Incassato - Spese</p>
        </div>
      </div>

      {/* METRICHE PRODUZIONE: IMMOBILI FOTOGRAFATI, VIDEO, SCATTI TOTALI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Immobili Fotografati</span>
            <p className="text-2xl font-extrabold">{totalShoots}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Video & Reel Realizzati</span>
            <p className="text-2xl font-extrabold">{totalVideos}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Saldi in Sospeso</span>
            <p className="text-2xl font-extrabold text-amber-400">€ {totalPending.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* GRAFICI: CLIENTI PIÙ ATTIVI E SERVIZI PIÙ RICHIESTI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clienti & Agenzie più attive */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
            Top Clienti & Agenzie Immobiliari
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Classifica committenti per volume d'affari nel periodo
          </p>

          {topClients.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Nessun dato nel periodo selezionato.</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-[11px] text-slate-700 dark:text-slate-300">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.agency} • {c.count} {c.count === 1 ? 'servizio' : 'servizi'}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    € {c.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Servizi più richiesti */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
            Servizi Più Richiesti
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Ripartizione incarichi per tipologia
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServices} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} name="Incarichi svolti" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
