import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Calendar as CalendarIcon, 
  Briefcase, 
  PackageCheck, 
  Receipt, 
  CircleDollarSign, 
  Users, 
  UserCheck,
  BarChart3, 
  Settings, 
  Camera, 
  X,
  LogOut
} from 'lucide-react';
import { ROLE_LABELS } from '../users/UsersManager';

interface Props {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    appointments, 
    jobs, 
    deliveries, 
    users,
    currentUser,
    setCurrentUserId,
    businessProfile,
    logout 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(a => a.date === todayStr && a.status === 'confermato').length;
  const activeJobsCount = jobs.filter(j => j.status !== '8_completato_pagato').length;
  const pendingDeliveriesCount = deliveries.filter(d => d.status !== 'consegnato' && d.status !== 'nuova_consegna_effettuata').length;
  const pendingPaymentsCount = jobs.filter(j => j.paymentStatus !== 'saldato' && j.balance > 0).length;

  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'appointments', 
      label: 'Appuntamenti', 
      icon: <CalendarCheck2 className="w-4 h-4" />,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined,
      badgeColor: 'bg-blue-600 text-white'
    },
    { 
      id: 'calendar', 
      label: 'Calendario', 
      icon: <CalendarIcon className="w-4 h-4" /> 
    },
    { 
      id: 'jobs', 
      label: 'Lavori & Produzione', 
      icon: <Briefcase className="w-4 h-4" />,
      badge: activeJobsCount > 0 ? activeJobsCount : undefined,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    },
    { 
      id: 'deliveries', 
      label: 'Consegne', 
      icon: <PackageCheck className="w-4 h-4" />,
      badge: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      id: 'expenses', 
      label: 'Spese', 
      icon: <Receipt className="w-4 h-4" /> 
    },
    { 
      id: 'revenue', 
      label: 'Incassi & Crediti', 
      icon: <CircleDollarSign className="w-4 h-4" />,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
      badgeColor: 'bg-emerald-600 text-white'
    },
    { 
      id: 'clients', 
      label: 'Clienti & Agenzie', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'users', 
      label: 'Gestione Team', 
      icon: <UserCheck className="w-4 h-4" />,
      badge: users.length,
      badgeColor: 'bg-indigo-600 text-white'
    },
    { 
      id: 'reports', 
      label: 'Statistiche', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      id: 'settings', 
      label: 'Impostazioni', 
      icon: <Settings className="w-4 h-4" /> 
    },
  ];

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand & Studio Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
              Home Frame <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">PRO</span>
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-[130px]">
              {businessProfile.studioName || 'Studio Gestionale'}
            </p>
          </div>
        </div>

        <button 
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Piattaforma
        </p>

        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Active Operator Switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Operatore Attivo</span>
          <button 
            onClick={() => handleSelect('users')}
            className="text-[10px] text-blue-400 hover:underline"
          >
            Gestisci team
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {currentUser?.name.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.name || 'Operatore'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser ? ROLE_LABELS[currentUser.role]?.label : 'Membro'}
            </p>
          </div>
          <button
            onClick={() => logout()}
            title="Disconnetti account"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-40 border-r border-slate-800 shadow-xl">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
