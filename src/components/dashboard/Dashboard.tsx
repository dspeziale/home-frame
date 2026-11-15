import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Briefcase, 
  PackageCheck, 
  Sparkles, 
  PhoneCall, 
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Camera,
  PlayCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    appointments, 
    jobs, 
    deliveries, 
    expenses, 
    setActiveTab, 
    setEditingAppointment, 
    setIsAppointmentModalOpen,
    setEditingJob,
    setIsJobModalOpen,
    setIsQuickAddOpen 
  } = useApp();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper date ranges
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  // Start & End of current week
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
  startOfWeek.setDate(diff);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

  // 1. KPI Count calculations
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === todayStr && a.status !== 'annullato');
  }, [appointments, todayStr]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date > todayStr && a.status === 'confermato')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [appointments, todayStr]);

  const weekAppointmentsCount = useMemo(() => {
    return appointments.filter(a => a.date >= startOfWeekStr && a.date <= endOfWeekStr && a.status !== 'annullato').length;
  }, [appointments, startOfWeekStr, endOfWeekStr]);

  const completedServicesCount = useMemo(() => {
    return jobs.filter(j => j.status === '7_consegnato' || j.status === '8_completato_pagato').length;
  }, [jobs]);

  const pendingShootJobsCount = useMemo(() => {
    return jobs.filter(j => j.status === '1_confermato' || j.status === '2_da_effettuare').length;
  }, [jobs]);

  const editingJobsCount = useMemo(() => {
    return jobs.filter(j => j.status === '4_selezione' || j.status === '5_editing').length;
  }, [jobs]);

  const pendingDeliveriesCount = useMemo(() => {
    return deliveries.filter(d => d.status !== 'consegnato' && d.status !== 'nuova_consegna_effettuata').length;
  }, [deliveries]);

  const deliveredCount = useMemo(() => {
    return deliveries.filter(d => d.status === 'consegnato' || d.status === 'nuova_consegna_effettuata').length;
  }, [deliveries]);

  // 2. Financial Metrics for current month
  const currentMonthJobs = useMemo(() => {
    return jobs.filter(j => {
      const d = new Date(j.shootDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [jobs, currentYear, currentMonth]);

  const monthRevenue = useMemo(() => {
    return currentMonthJobs.reduce((sum, j) => sum + j.price, 0);
  }, [currentMonthJobs]);

  const monthCollected = useMemo(() => {
    return currentMonthJobs.reduce((sum, j) => sum + (j.price - j.balance), 0);
  }, [currentMonthJobs]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [expenses, currentYear, currentMonth]);

  const monthExpensesTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  const monthNetProfit = useMemo(() => {
    return monthCollected - monthExpensesTotal;
  }, [monthCollected, monthExpensesTotal]);

  const totalPendingPayments = useMemo(() => {
    return jobs.reduce((sum, j) => sum + (j.balance || 0), 0);
  }, [jobs]);

  // 3. Monthly Financial Trends data (last 6 months)
  const monthlyChartData = useMemo(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = targetDate.getMonth();
      const y = targetDate.getFullYear();
      const label = `${months[mIdx]} ${String(y).slice(-2)}`;

      const mJobs = jobs.filter(j => {
        const d = new Date(j.shootDate);
        return d.getFullYear() === y && d.getMonth() === mIdx;
      });

      const mExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === y && d.getMonth() === mIdx;
      });

      const rev = mJobs.reduce((sum, j) => sum + j.price, 0);
      const coll = mJobs.reduce((sum, j) => sum + (j.price - j.balance), 0);
      const exp = mExpenses.reduce((sum, e) => sum + e.amount, 0);
      const prof = Math.max(0, coll - exp);

      result.push({
        name: label,
        incassi: coll,
        fatturato: rev,
        spese: exp,
        profitto: prof,
        servizi: mJobs.length
      });
    }

    return result;
  }, [jobs, expenses]);

  // 4. Service Distribution
  const serviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      counts[j.serviceType] = (counts[j.serviceType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [jobs]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-600/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Panoramica Attività & Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Oggi hai <span className="text-blue-400 underline decoration-blue-500 underline-offset-4">{todayAppointments.length}</span> {todayAppointments.length === 1 ? 'appuntamento' : 'appuntamenti'} in programma
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Monitora lo stato delle riprese, l'editing in corso, le scadenze delle consegne e il rendiconto finanziario in tempo reale.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsAppointmentModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Nuovo Appuntamento</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Vedi Schede Lavoro</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICHE FINANZIARIE DEL MESE */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
          Andamento Finanziario del Mese in Corso
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Incassi Effettivi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-premium transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Incassi Effettivi</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Euro className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              € {monthCollected.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Fatturato emesso: € {monthRevenue.toFixed(2)}
            </p>
          </div>

          {/* Spese del Mese */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-premium transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Spese del Mese</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              € {monthExpensesTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Carburante, attrezzatura e software
            </p>
          </div>

          {/* Guadagno Netto */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-premium transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Guadagno Netto Mese</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${monthNetProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
              € {monthNetProfit.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Incassi effettivi - Spese
            </p>
          </div>

          {/* Da Ricevere */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-premium transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pagamenti da Ricevere</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              € {totalPendingPayments.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Saldi insoluti su lavori attivi
            </p>
          </div>
        </div>
      </div>

      {/* METRICHE OPERATIVE (APPUNTAMENTI, LAVORI, CONSEGNE) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
          Stato Operativo & Produzione
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Appuntamenti Oggi</span>
            <p className="text-xl font-bold text-blue-600 mt-1">{todayAppointments.length}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Settimana Corrente</span>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{weekAppointmentsCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Ancora da Fotografare</span>
            <p className="text-xl font-bold text-indigo-600 mt-1">{pendingShootJobsCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">In Fase di Editing</span>
            <p className="text-xl font-bold text-purple-600 mt-1">{editingJobsCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Materiale da Consegnare</span>
            <p className="text-xl font-bold text-amber-600 mt-1">{pendingDeliveriesCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Consegne Effettuate</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">{deliveredCount}</p>
          </div>
        </div>
      </div>

      {/* SEZIONE APPUNTAMENTI DI OGGI & AZIONI RAPIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista Appuntamenti di Oggi (Mobile & Desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Appuntamenti di Oggi ({todayStr})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Vedi tutti <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nessun servizio in programma per oggi
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Ottimo momento per dedicarsi all'editing delle foto e alla consegna dei video!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(apt => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.propertyAddress)}`;
                return (
                  <div 
                    key={apt.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-xs">
                          {apt.time}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {apt.propertyAddress}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {apt.clientName} {apt.agency ? `(${apt.agency})` : ''} • <span className="font-semibold">{apt.serviceType}</span>
                      </p>
                      {apt.notes && (
                        <p className="text-[11px] text-slate-500 italic truncate">
                          Nota: {apt.notes}
                        </p>
                      )}
                    </div>

                    {/* Azioni rapide mobile-first: Chiama & Google Maps */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                      <a
                        href={`tel:${apt.phone}`}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chiama</span>
                      </a>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Maps</span>
                      </a>
                      <button
                        onClick={() => {
                          setEditingAppointment(apt);
                          setIsAppointmentModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                      >
                        Dettagli
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prossimi Appuntamenti in Calendario */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Prossimi Servizi
              </h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Calendario
              </button>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Nessun appuntamento futuro programmato.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 4).map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setEditingAppointment(apt);
                      setIsAppointmentModalOpen(true);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {apt.date} ore {apt.time}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {apt.propertyType}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {apt.propertyAddress}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {apt.clientName} • € {apt.agreedPrice}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            + Inserisci Nuovo Incarico
          </button>
        </div>
      </div>

      {/* GRAFICI INTUITIVI (ANDAMENTO INCASSI, SPESE E PROFITTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Mensile Incassi, Spese e Profitto */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Andamento Economico (Ultimi 6 Mesi)
              </h3>
              <p className="text-xs text-slate-400">
                Incassi effettivi, spese sostenute e guadagno netto
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Incassi
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Spese
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span> Profitto
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncassi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfitto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                <Tooltip 
                  formatter={(val: any) => [`€ ${Number(val).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="incassi" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncassi)" name="Incassi" />
                <Area type="monotone" dataKey="spese" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} name="Spese" />
                <Area type="monotone" dataKey="profitto" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfitto)" name="Guadagno Netto" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tipologie di Servizi Richiesti */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
            Tipologie di Servizi
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Distribuzione dei servizi svolti
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Servizi effettuati" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
