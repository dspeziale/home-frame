import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { QuickAddModal } from './components/layout/QuickAddModal';

// Moduli principali
import { Dashboard } from './components/dashboard/Dashboard';
import { AppointmentsList } from './components/appointments/AppointmentsList';
import { CalendarView } from './components/calendar/CalendarView';
import { JobsBoard } from './components/jobs/JobsBoard';
import { DeliveriesManager } from './components/deliveries/DeliveriesManager';
import { ExpensesManager } from './components/finances/ExpensesManager';
import { RevenueManager } from './components/finances/RevenueManager';
import { ClientsManager } from './components/clients/ClientsManager';
import { UsersManager } from './components/users/UsersManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { SettingsManager } from './components/settings/SettingsManager';

// Modali globali
import { AppointmentModal } from './components/appointments/AppointmentModal';
import { JobModal } from './components/jobs/JobModal';
import { DeliveryModal } from './components/deliveries/DeliveryModal';
import { ExpenseModal } from './components/finances/ExpenseModal';
import { ClientModal } from './components/clients/ClientModal';
import { UserModal } from './components/users/UserModal';
import { PhotoGalleryModal } from './components/photos/PhotoGalleryModal';
import { LoginView } from './components/auth/LoginView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <AppointmentsList />;
      case 'calendar':
        return <CalendarView />;
      case 'jobs':
        return <JobsBoard />;
      case 'deliveries':
        return <DeliveriesManager />;
      case 'expenses':
        return <ExpensesManager />;
      case 'revenue':
        return <RevenueManager />;
      case 'clients':
        return <ClientsManager />;
      case 'users':
        return <UsersManager />;
      case 'reports':
        return <ReportsManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Desktop & Mobile Drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header onToggleMobileSidebar={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Bottom Action Dock for Mobile Devices */}
      <MobileNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Global Modals */}
      <AppointmentModal />
      <JobModal />
      <DeliveryModal />
      <ExpenseModal />
      <ClientModal />
      <UserModal />
      <PhotoGalleryModal />
      <QuickAddModal />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
