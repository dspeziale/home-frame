import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Calendar, PackageCheck, CreditCard, X } from 'lucide-react';
import { AppNotification } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    if (n.linkTab) {
      setActiveTab(n.linkTab as any);
    }
    onClose();
  };

  const getIcon = (type: string, title: string) => {
    if (title.includes('Appuntamento')) return <Calendar className="w-4 h-4 text-blue-500" />;
    if (title.includes('Consegna') || title.includes('RITARDO')) return <PackageCheck className="w-4 h-4 text-amber-500" />;
    if (title.includes('Saldo') || title.includes('incassare')) return <CreditCard className="w-4 h-4 text-emerald-500" />;
    if (type === 'alert') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-float z-50 overflow-hidden animate-in fade-in duration-150">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifiche & Avvisi</span>
          {notifications.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Segna lette
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Tutto in ordine!</p>
            <p className="text-xs mt-1 text-slate-400">Nessuna consegna scaduta, pagamenti o appuntamenti urgenti.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex gap-3 items-start ${
                !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(n.type, n.title)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
