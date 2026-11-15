import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Plus, 
  Briefcase, 
  PackageCheck,
  Menu
} from 'lucide-react';

interface Props {
  onOpenMobileMenu: () => void;
}

export const MobileNav: React.FC<Props> = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, appointments, deliveries } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAptCount = appointments.filter(a => a.date === todayStr && a.status === 'confermato').length;
  const pendingDelCount = deliveries.filter(d => d.status !== 'consegnato' && d.status !== 'nuova_consegna_effettuata').length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-12 py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Appuntamenti */}
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex flex-col items-center justify-center w-12 py-1 relative transition-colors ${
            activeTab === 'appointments' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarCheck2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Appunt.</span>
          {todayAptCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-600"></span>
          )}
        </button>

        {/* Central Plus Button (Super Fast Mobile Action) */}
        <div className="relative -top-4">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-90 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all"
            aria-label="Nuovo elemento rapido"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Lavori */}
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center justify-center w-12 py-1 transition-colors ${
            activeTab === 'jobs' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lavori</span>
        </button>

        {/* Consegne / Menu */}
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex flex-col items-center justify-center w-12 py-1 relative transition-colors ${
            activeTab === 'deliveries' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <PackageCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Consegne</span>
          {pendingDelCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>

        {/* Menu completo */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center w-12 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Altro</span>
        </button>
      </div>
    </div>
  );
};
