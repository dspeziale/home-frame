import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus,
  Eye
} from 'lucide-react';

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { appointments, setEditingAppointment, setIsAppointmentModalOpen } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');

  // Navigazione temporale
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (mode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (mode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (mode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (mode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper date formatting
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const weekDayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Status color codes
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confermato':
        return 'bg-blue-600 text-white border-blue-700';
      case 'in_attesa':
        return 'bg-amber-500 text-white border-amber-600';
      case 'annullato':
        return 'bg-red-500 text-white border-red-600';
      case 'completato':
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  // Month grid generation (Monday to Sunday)
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // 0=Mon, 6=Sun
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Prev month trailing days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month leading days to complete grid (42 days or 35 days)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Week days generation
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push({
        dateObj: d,
        dayNumber: d.getDate(),
        dayName: weekDayNames[i],
        dateStr: `${y}-${m}-${dd}`
      });
    }
    return days;
  }, [currentDate]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper per selezionare appuntamento
  const handleSelectAppointment = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Month & Year */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Oggi
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* View Mode Switches: Mese / Settimana / Giorno */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'month' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mese
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'week' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Settimana
            </button>
            <button
              onClick={() => setMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'day' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Giorno
            </button>
          </div>

          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Prenota</span>
          </button>
        </div>
      </div>

      {/* Legenda Colori */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium px-2 text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Confermato
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> In attesa
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Completato
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Annullato
        </span>
      </div>

      {/* VISTA 1: MENSILE */}
      {mode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
          {/* Header Giorni della Settimana */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
            {weekDayNames.map(dayName => (
              <div key={dayName}>{dayName}</div>
            ))}
          </div>

          {/* Griglia Giorni */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {monthDays.map((dayItem, idx) => {
              const isToday = dayItem.dateStr === todayStr;
              const dayAppointments = appointments.filter(a => a.date === dayItem.dateStr);

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    !dayItem.isCurrentMonth 
                      ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 opacity-60' 
                      : 'hover:bg-blue-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayItem.dayNumber}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {dayAppointments.length} serv.
                      </span>
                    )}
                  </div>

                  {/* Badges Appuntamenti del giorno */}
                  <div className="space-y-1 overflow-y-auto max-h-24">
                    {dayAppointments.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => handleSelectAppointment(apt)}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer truncate shadow-2xs hover:scale-[1.02] transition-transform ${getStatusColor(apt.status)}`}
                        title={`${apt.time} - ${apt.clientName} (${apt.propertyAddress})`}
                      >
                        <span className="opacity-90 mr-1">{apt.time}</span>
                        <span>{apt.propertyAddress}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: SETTIMANALE */}
      {mode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map(wDay => {
            const isToday = wDay.dateStr === todayStr;
            const dayAppointments = appointments.filter(a => a.date === wDay.dateStr);

            return (
              <div 
                key={wDay.dateStr}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-4 border flex flex-col ${
                  isToday 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                    : 'border-slate-200/80 dark:border-slate-800 shadow-subtle'
                }`}
              >
                {/* Header Giorno */}
                <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    {wDay.dayName}
                  </span>
                  <span className={`text-xl font-extrabold inline-block mt-0.5 ${isToday ? 'text-blue-600' : 'text-slate-800 dark:text-slate-100'}`}>
                    {wDay.dayNumber}
                  </span>
                </div>

                {/* Appuntamenti */}
                <div className="flex-1 space-y-2">
                  {dayAppointments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-4 italic">
                      Nessun servizio
                    </p>
                  ) : (
                    dayAppointments.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => handleSelectAppointment(apt)}
                        className={`p-2.5 rounded-2xl cursor-pointer transition-all shadow-2xs hover:shadow-sm ${getStatusColor(apt.status)}`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {apt.time}
                          </span>
                          <span>€ {apt.agreedPrice}</span>
                        </div>
                        <p className="text-xs font-bold line-clamp-1">
                          {apt.propertyAddress}
                        </p>
                        <p className="text-[10px] opacity-90 truncate">
                          {apt.clientName} {apt.agency ? `(${apt.agency})` : ''}
                        </p>
                        <p className="text-[10px] opacity-80 mt-1 font-medium truncate">
                          {apt.serviceType}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 3: GIORNALIERA */}
      {mode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Programma del {currentDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500">
                Tutti i dettagli operativi per la giornata selezionata
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs">
              {appointments.filter(a => a.date === currentDate.toISOString().split('T')[0]).length} Incarichi
            </span>
          </div>

          <div className="space-y-4">
            {appointments.filter(a => a.date === currentDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nessun appuntamento in questo giorno.</p>
              </div>
            ) : (
              appointments
                .filter(a => a.date === currentDate.toISOString().split('T')[0])
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => handleSelectAppointment(apt)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs">
                          {apt.time}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {apt.propertyAddress}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        € {apt.agreedPrice}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <div>Cliente: <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.clientName}</span></div>
                      <div>Telefono: <span className="font-semibold">{apt.phone}</span></div>
                      <div>Servizio: <span className="font-semibold text-blue-600">{apt.serviceType}</span></div>
                      <div>Immobile: <span>{apt.propertyType} • {apt.squareMeters} m²</span></div>
                    </div>

                    {apt.specialRequests && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl mt-2 font-medium">
                        ★ {apt.specialRequests}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
