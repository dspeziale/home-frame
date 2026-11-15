import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Receipt, Briefcase, User, X } from 'lucide-react';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    setIsQuickAddOpen, 
    setIsAppointmentModalOpen, 
    setEditingAppointment,
    setIsExpenseModalOpen, 
    setEditingExpense,
    setIsJobModalOpen, 
    setEditingJob,
    setIsClientModalOpen, 
    setEditingClient 
  } = useApp();

  if (!isQuickAddOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-float border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Aggiunta Rapida
            </h3>
            <p className="text-xs text-slate-500">
              Cosa vuoi registrare adesso?
            </p>
          </div>
          <button 
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-5">
          {/* Appuntamento */}
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsAppointmentModalOpen(true);
              setIsQuickAddOpen(false);
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">Nuovo Appuntamento</span>
          </button>

          {/* Registra Spesa */}
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
              setIsQuickAddOpen(false);
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">Registra Spesa</span>
          </button>

          {/* Nuova Scheda Lavoro */}
          <button
            onClick={() => {
              setEditingJob(null);
              setIsJobModalOpen(true);
              setIsQuickAddOpen(false);
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">Nuovo Lavoro</span>
          </button>

          {/* Nuovo Cliente */}
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
              setIsQuickAddOpen(false);
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-100 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-purple-600 text-white shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">Nuovo Cliente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
