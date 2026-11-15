import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun, 
  Plus, 
  Camera, 
  Menu,
  Sparkles
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface Props {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<Props> = ({ onToggleMobileSidebar }) => {
  const { 
    activeTab, 
    businessProfile, 
    darkMode, 
    toggleDarkMode, 
    unreadNotificationsCount, 
    setIsSearchOpen, 
    setIsQuickAddOpen 
  } = useApp();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Panoramica';
      case 'appointments': return 'Gestione Appuntamenti';
      case 'calendar': return 'Calendario Servizi';
      case 'jobs': return 'Schede Lavoro & Produzione';
      case 'deliveries': return 'Consegne Materiale';
      case 'expenses': return 'Gestione Spese';
      case 'revenue': return 'Incassi & Crediti';
      case 'clients': return 'Archivio Clienti & Agenzie';
      case 'users': return 'Gestione Utenti & Team';
      case 'reports': return 'Statistiche & Report';
      case 'settings': return 'Impostazioni & Cloud';
      default: return 'Home Frame';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Apri menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm lg:hidden">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {businessProfile.studioName || 'Studio Professionale Fotografia Immobiliare'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Search, Notifications, Theme, Quick Add */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/50"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Cerca ovunque...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifiche"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={darkMode ? 'Passa a tema chiaro' : 'Passa a tema scuro'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nuovo</span>
        </button>
      </div>
    </header>
  );
};
