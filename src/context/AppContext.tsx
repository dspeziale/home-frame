import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Client, 
  Appointment, 
  Job, 
  DeliveryItem, 
  Expense, 
  ServicePriceConfig, 
  BusinessProfile, 
  AppNotification, 
  JobStatus, 
  AppUser
} from '../types';
import { 
  STORAGE_KEYS, 
  loadFromStorage, 
  saveToStorage, 
  ensureInitialData, 
  DEFAULT_SERVICE_CONFIGS, 
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_BUSINESS_PROFILE,
  DEFAULT_USERS,
  resetToSeedData
} from '../lib/storage';

export type NavigationTab = 
  | 'dashboard'
  | 'appointments'
  | 'calendar'
  | 'jobs'
  | 'deliveries'
  | 'expenses'
  | 'revenue'
  | 'clients'
  | 'users'
  | 'reports'
  | 'settings';

interface AppContextType {
  // Navigation & theme
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Users & Auth
  users: AppUser[];
  currentUserId: string;
  currentUser: AppUser | undefined;
  setCurrentUserId: (id: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: any) => Promise<{ success: boolean; message?: string }>;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => AppUser;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;
  editingUser: AppUser | null;
  setEditingUser: (u: AppUser | null) => void;

  // Photo Gallery Modal
  photoGalleryJob: Job | null;
  setPhotoGalleryJob: (job: Job | null) => void;

  // Data states
  clients: Client[];
  appointments: Appointment[];
  jobs: Job[];
  deliveries: DeliveryItem[];
  expenses: Expense[];
  servicesConfig: ServicePriceConfig[];
  expenseCategories: string[];
  businessProfile: BusinessProfile;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Modals
  isAppointmentModalOpen: boolean;
  setIsAppointmentModalOpen: (open: boolean) => void;
  editingAppointment: Appointment | null;
  setEditingAppointment: (apt: Appointment | null) => void;

  isJobModalOpen: boolean;
  setIsJobModalOpen: (open: boolean) => void;
  editingJob: Job | null;
  setEditingJob: (job: Job | null) => void;

  isClientModalOpen: boolean;
  setIsClientModalOpen: (open: boolean) => void;
  editingClient: Client | null;
  setEditingClient: (client: Client | null) => void;

  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (exp: Expense | null) => void;

  isDeliveryModalOpen: boolean;
  setIsDeliveryModalOpen: (open: boolean) => void;
  editingDelivery: DeliveryItem | null;
  setEditingDelivery: (del: DeliveryItem | null) => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;

  // CRUD Methods
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  duplicateAppointment: (id: string) => void;

  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  deleteJob: (id: string) => void;

  addDelivery: (delivery: Omit<DeliveryItem, 'id' | 'createdAt'>) => DeliveryItem;
  updateDelivery: (id: string, updates: Partial<DeliveryItem>) => void;
  deleteDelivery: (id: string) => void;

  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  updateServicesConfig: (configs: ServicePriceConfig[]) => void;
  addExpenseCategory: (cat: string) => void;
  updateBusinessProfile: (profile: BusinessProfile) => void;

  resetData: () => void;
  reloadAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('immophoto_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('immophoto_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('immophoto_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  ensureInitialData();

  // Core entities state
  const [users, setUsers] = useState<AppUser[]>(() => 
    loadFromStorage<AppUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() => 
    loadFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].id)
  );

  const [authSessionUser, setAuthSessionUser] = useState<AppUser | null>(() => {
    return loadFromStorage<AppUser | null>(STORAGE_KEYS.AUTH_USER, DEFAULT_USERS[0]);
  });

  const isAuthenticated = !!authSessionUser;
  const [clients, setClients] = useState<Client[]>(() => 
    loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, [])
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() => 
    loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [])
  );
  const [jobs, setJobs] = useState<Job[]>(() => 
    loadFromStorage<Job[]>(STORAGE_KEYS.JOBS, [])
  );
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(() => 
    loadFromStorage<DeliveryItem[]>(STORAGE_KEYS.DELIVERIES, [])
  );
  const [expenses, setExpenses] = useState<Expense[]>(() => 
    loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  );
  const [servicesConfig, setServicesConfig] = useState<ServicePriceConfig[]>(() => 
    loadFromStorage<ServicePriceConfig[]>(STORAGE_KEYS.SERVICES_CONFIG, DEFAULT_SERVICE_CONFIGS)
  );
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES)
  );
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => 
    loadFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESS_PROFILE, DEFAULT_BUSINESS_PROFILE)
  );

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => 
    loadFromStorage<string[]>('immophoto_read_notifications', [])
  );

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<DeliveryItem | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [photoGalleryJob, setPhotoGalleryJob] = useState<Job | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // Persist entities
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.JOBS, jobs);
  }, [jobs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DELIVERIES, deliveries);
  }, [deliveries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SERVICES_CONFIG, servicesConfig);
  }, [servicesConfig]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXPENSE_CATEGORIES, expenseCategories);
  }, [expenseCategories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BUSINESS_PROFILE, businessProfile);
  }, [businessProfile]);

  useEffect(() => {
    saveToStorage('immophoto_read_notifications', readNotificationIds);
  }, [readNotificationIds]);

  // Compute notifications
  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    appointments.forEach(apt => {
      if (apt.date === todayStr && apt.status === 'confermato') {
        list.push({
          id: `apt-today-${apt.id}`,
          title: `Appuntamento OGGI alle ${apt.time}`,
          message: `${apt.clientName} - ${apt.propertyAddress} (${apt.serviceType})`,
          type: 'alert',
          date: apt.date,
          linkTab: 'appointments',
          itemId: apt.id,
          read: readNotificationIds.includes(`apt-today-${apt.id}`)
        });
      } else if (apt.date === tomorrowStr && apt.status === 'confermato') {
        list.push({
          id: `apt-tomorrow-${apt.id}`,
          title: `Appuntamento DOMANI alle ${apt.time}`,
          message: `${apt.clientName} - ${apt.propertyAddress}`,
          type: 'info',
          date: apt.date,
          linkTab: 'appointments',
          itemId: apt.id,
          read: readNotificationIds.includes(`apt-tomorrow-${apt.id}`)
        });
      }
    });

    deliveries.forEach(del => {
      if (del.status !== 'consegnato' && del.status !== 'nuova_consegna_effettuata') {
        if (del.targetDeliveryDate < todayStr) {
          list.push({
            id: `del-late-${del.id}`,
            title: `Consegna in RITARDO!`,
            message: `Scaduta il ${del.targetDeliveryDate}: ${del.clientName} - ${del.propertyAddress}`,
            type: 'alert',
            date: del.targetDeliveryDate,
            linkTab: 'deliveries',
            itemId: del.id,
            read: readNotificationIds.includes(`del-late-${del.id}`)
          });
        } else if (del.targetDeliveryDate === todayStr || del.targetDeliveryDate === tomorrowStr) {
          list.push({
            id: `del-urgent-${del.id}`,
            title: `Consegna in scadenza (${del.targetDeliveryDate})`,
            message: `${del.clientName} - ${del.propertyAddress}`,
            type: 'warning',
            date: del.targetDeliveryDate,
            linkTab: 'deliveries',
            itemId: del.id,
            read: readNotificationIds.includes(`del-urgent-${del.id}`)
          });
        }
      }
    });

    jobs.forEach(job => {
      if (job.status === '4_selezione' || job.status === '5_editing') {
        list.push({
          id: `job-process-${job.id}`,
          title: `Lavoro da ultimare (${job.status === '4_selezione' ? 'Selezione' : 'Editing'})`,
          message: `${job.clientName} - Consegna prevista: ${job.targetDeliveryDate}`,
          type: 'info',
          date: job.shootDate,
          linkTab: 'jobs',
          itemId: job.id,
          read: readNotificationIds.includes(`job-process-${job.id}`)
        });
      }
    });

    jobs.forEach(job => {
      if ((job.status === '7_consegnato' || job.status === '6_pronto') && job.paymentStatus !== 'saldato' && job.balance > 0) {
        list.push({
          id: `payment-pending-${job.id}`,
          title: `Saldo da incassare: € ${job.balance.toFixed(2)}`,
          message: `${job.clientName} (${job.agency || 'Privato'}) - ${job.propertyAddress}`,
          type: 'warning',
          date: job.shootDate,
          linkTab: 'revenue',
          itemId: job.id,
          read: readNotificationIds.includes(`payment-pending-${job.id}`)
        });
      }
    });

    return list;
  }, [appointments, deliveries, jobs, readNotificationIds]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setReadNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const markAllNotificationsAsRead = () => {
    setReadNotificationIds(notifications.map(n => n.id));
  };

  // -------------------------------------------------------------
  // USER CRUD
  // -------------------------------------------------------------
  const addUser = (data: Omit<AppUser, 'id' | 'createdAt'>): AppUser => {
    const newUser: AppUser = {
      ...data,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!found) {
      return { success: false, message: 'Nessun account trovato con questo indirizzo email.' };
    }
    if (found.password && found.password !== password) {
      return { success: false, message: 'Password errata. Riprova.' };
    }
    setAuthSessionUser(found);
    setCurrentUserId(found.id);
    saveToStorage(STORAGE_KEYS.AUTH_USER, found);
    return { success: true };
  };

  const logout = () => {
    setAuthSessionUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  };

  const register = async (name: string, email: string, password: string, role: any) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'Esiste già un account registrato con questa email.' };
    }
    const newUser = addUser({
      name,
      email: trimmedEmail,
      password,
      role: role || 'photographer',
      phone: '',
      active: true
    });
    setAuthSessionUser(newUser);
    setCurrentUserId(newUser.id);
    saveToStorage(STORAGE_KEYS.AUTH_USER, newUser);
    return { success: true };
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      alert('Impossibile eliminare l\'unico utente presente.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUserId === id) {
      const remaining = users.filter(u => u.id !== id);
      if (remaining.length > 0) setCurrentUserId(remaining[0].id);
    }
  };

  // -------------------------------------------------------------
  // APPOINTMENTS CRUD
  // -------------------------------------------------------------
  const addAppointment = (data: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newId = 'apt-' + Date.now();
    const newJobId = 'job-' + Date.now();

    let matchedClientId = data.clientId;
    if (!matchedClientId && data.clientName) {
      const existing = clients.find(c => 
        c.fullName.toLowerCase() === data.clientName.toLowerCase() ||
        c.phone === data.phone
      );
      if (existing) {
        matchedClientId = existing.id;
      } else {
        const newClient: Client = {
          id: 'cli-' + Date.now(),
          fullName: data.clientName,
          agency: data.agency || '',
          phone: data.phone,
          email: data.email,
          address: data.propertyAddress,
          createdAt: new Date().toISOString()
        };
        setClients(prev => [newClient, ...prev]);
        matchedClientId = newClient.id;
      }
    }

    const newAppointment: Appointment = {
      ...data,
      id: newId,
      clientId: matchedClientId,
      jobId: newJobId,
      createdAt: new Date().toISOString()
    };

    const shootD = new Date(data.date);
    const targetDelD = new Date(shootD);
    targetDelD.setDate(targetDelD.getDate() + 3);
    const targetDeliveryDate = targetDelD.toISOString().split('T')[0];

    const serviceConf = servicesConfig.find(s => s.name === data.serviceType);
    const depositAmount = data.deposit || 0;
    const balanceAmount = Math.max(0, data.agreedPrice - depositAmount);

    const newJob: Job = {
      id: newJobId,
      appointmentId: newId,
      clientId: matchedClientId,
      clientName: data.clientName,
      agency: data.agency,
      phone: data.phone,
      email: data.email,
      propertyAddress: data.propertyAddress,
      shootDate: data.date,
      propertyType: data.propertyType,
      serviceType: data.serviceType,
      expectedPhotos: serviceConf?.defaultPhotos || 25,
      expectedVideos: serviceConf?.defaultVideos || 0,
      workNotes: data.specialRequests ? `Richieste: ${data.specialRequests}. ${data.notes || ''}` : (data.notes || ''),
      targetDeliveryDate: targetDeliveryDate,
      cloudFolderUrl: '',
      notes: data.notes || '',
      status: '1_confermato',
      assignedPhotographerId: data.assignedUserId || currentUserId,
      price: data.agreedPrice,
      deposit: depositAmount,
      balance: balanceAmount,
      paymentMethod: 'Bonifico',
      paymentStatus: depositAmount > 0 ? 'acconto_ricevuto' : 'in_attesa_acconto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDelivery: DeliveryItem = {
      id: 'del-' + Date.now(),
      jobId: newJobId,
      clientName: data.clientName,
      agency: data.agency,
      propertyAddress: data.propertyAddress,
      shootDate: data.date,
      targetDeliveryDate: targetDeliveryDate,
      cloudFolderUrl: '',
      materialDelivered: `${newJob.expectedPhotos} foto ${newJob.expectedVideos > 0 ? `+ ${newJob.expectedVideos} video` : ''}`,
      status: 'da_preparare',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    setJobs(prev => [newJob, ...prev]);
    setDeliveries(prev => [newDelivery, ...prev]);

    return newAppointment;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, ...updates };

      if (a.jobId) {
        setJobs(prevJobs => prevJobs.map(j => {
          if (j.id === a.jobId) {
            const price = updates.agreedPrice !== undefined ? updates.agreedPrice : j.price;
            const deposit = updates.deposit !== undefined ? updates.deposit : j.deposit;
            return {
              ...j,
              clientName: updates.clientName || j.clientName,
              agency: updates.agency !== undefined ? updates.agency : j.agency,
              phone: updates.phone || j.phone,
              email: updates.email || j.email,
              propertyAddress: updates.propertyAddress || j.propertyAddress,
              shootDate: updates.date || j.shootDate,
              serviceType: updates.serviceType || j.serviceType,
              assignedPhotographerId: updates.assignedUserId || j.assignedPhotographerId,
              price: price,
              deposit: deposit,
              balance: Math.max(0, price - deposit),
              updatedAt: new Date().toISOString()
            };
          }
          return j;
        }));
      }

      return updated;
    }));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const duplicateAppointment = (id: string) => {
    const original = appointments.find(a => a.id === id);
    if (!original) return;

    const d = new Date(original.date);
    d.setDate(d.getDate() + 7);
    const newDateStr = d.toISOString().split('T')[0];

    addAppointment({
      clientId: original.clientId,
      clientName: original.clientName,
      agency: original.agency,
      phone: original.phone,
      email: original.email,
      propertyAddress: original.propertyAddress,
      date: newDateStr,
      time: original.time,
      propertyType: original.propertyType,
      squareMeters: original.squareMeters,
      rooms: original.rooms,
      serviceType: original.serviceType,
      agreedPrice: original.agreedPrice,
      deposit: 0,
      notes: original.notes ? `[Duplicato] ${original.notes}` : '',
      specialRequests: original.specialRequests,
      status: 'confermato',
      assignedUserId: original.assignedUserId
    });
  };

  // -------------------------------------------------------------
  // JOBS CRUD
  // -------------------------------------------------------------
  const addJob = (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job => {
    const newId = 'job-' + Date.now();
    const balance = Math.max(0, data.price - (data.deposit || 0));
    const newJob: Job = {
      ...data,
      id: newId,
      balance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDelivery: DeliveryItem = {
      id: 'del-' + Date.now(),
      jobId: newId,
      clientName: data.clientName,
      agency: data.agency,
      propertyAddress: data.propertyAddress,
      shootDate: data.shootDate,
      targetDeliveryDate: data.targetDeliveryDate,
      cloudFolderUrl: data.cloudFolderUrl || '',
      materialDelivered: `${data.expectedPhotos} foto ${data.expectedVideos > 0 ? `+ ${data.expectedVideos} video` : ''}`,
      status: 'da_preparare',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);
    setDeliveries(prev => [newDelivery, ...prev]);
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== id) return j;
      const price = updates.price !== undefined ? updates.price : j.price;
      const deposit = updates.deposit !== undefined ? updates.deposit : j.deposit;
      const balance = Math.max(0, price - deposit);

      const updated = {
        ...j,
        ...updates,
        price,
        deposit,
        balance,
        updatedAt: new Date().toISOString()
      };

      if (updates.targetDeliveryDate || updates.cloudFolderUrl !== undefined || updates.actualDeliveryDate) {
        setDeliveries(prevDel => prevDel.map(d => {
          if (d.jobId === id) {
            return {
              ...d,
              targetDeliveryDate: updates.targetDeliveryDate || d.targetDeliveryDate,
              cloudFolderUrl: updates.cloudFolderUrl !== undefined ? updates.cloudFolderUrl : d.cloudFolderUrl,
              actualDeliveryDate: updates.actualDeliveryDate !== undefined ? updates.actualDeliveryDate : d.actualDeliveryDate,
            };
          }
          return d;
        }));
      }

      return updated;
    }));
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== id) return j;
      const updates: Partial<Job> = { status };
      
      if (status === '6_pronto') {
        setDeliveries(prevDels => prevDels.map(d => d.jobId === id ? { ...d, status: 'pronto' } : d));
      } else if (status === '7_consegnato') {
        const todayStr = new Date().toISOString().split('T')[0];
        updates.actualDeliveryDate = updates.actualDeliveryDate || todayStr;
        setDeliveries(prevDels => prevDels.map(d => d.jobId === id ? { ...d, status: 'consegnato', actualDeliveryDate: todayStr } : d));
      } else if (status === '8_completato_pagato') {
        updates.paymentStatus = 'saldato';
        updates.balance = 0;
        updates.paymentDate = updates.paymentDate || new Date().toISOString().split('T')[0];
      }

      return {
        ...j,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setDeliveries(prev => prev.filter(d => d.jobId !== id));
  };

  // -------------------------------------------------------------
  // DELIVERIES CRUD
  // -------------------------------------------------------------
  const addDelivery = (data: Omit<DeliveryItem, 'id' | 'createdAt'>): DeliveryItem => {
    const newDelivery: DeliveryItem = {
      ...data,
      id: 'del-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setDeliveries(prev => [newDelivery, ...prev]);
    return newDelivery;
  };

  const updateDelivery = (id: string, updates: Partial<DeliveryItem>) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id !== id) return d;
      const updated = { ...d, ...updates };

      if (updates.status === 'consegnato' && d.jobId) {
        setJobs(prevJobs => prevJobs.map(j => {
          if (j.id === d.jobId && j.status !== '8_completato_pagato') {
            return {
              ...j,
              status: '7_consegnato',
              actualDeliveryDate: updates.actualDeliveryDate || new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString()
            };
          }
          return j;
        }));
      }

      return updated;
    }));
  };

  const deleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
  };

  // -------------------------------------------------------------
  // CLIENTS CRUD
  // -------------------------------------------------------------
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: 'cli-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // -------------------------------------------------------------
  // EXPENSES CRUD
  // -------------------------------------------------------------
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...data,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // -------------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------------
  const updateServicesConfig = (configs: ServicePriceConfig[]) => {
    setServicesConfig(configs);
  };

  const addExpenseCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !expenseCategories.includes(trimmed)) {
      setExpenseCategories(prev => [...prev, trimmed]);
    }
  };

  const updateBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
  };

  const resetData = () => {
    resetToSeedData();
    reloadAllData();
  };

  const reloadAllData = () => {
    setUsers(loadFromStorage<AppUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS));
    setCurrentUserId(loadFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].id));
    setClients(loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []));
    setAppointments(loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []));
    setJobs(loadFromStorage<Job[]>(STORAGE_KEYS.JOBS, []));
    setDeliveries(loadFromStorage<DeliveryItem[]>(STORAGE_KEYS.DELIVERIES, []));
    setExpenses(loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []));
    setServicesConfig(loadFromStorage<ServicePriceConfig[]>(STORAGE_KEYS.SERVICES_CONFIG, DEFAULT_SERVICE_CONFIGS));
    setExpenseCategories(loadFromStorage<string[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES));
    setBusinessProfile(loadFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESS_PROFILE, DEFAULT_BUSINESS_PROFILE));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        users,
        currentUserId,
        currentUser,
        setCurrentUserId,
        isAuthenticated,
        login,
        logout,
        register,
        addUser,
        updateUser,
        deleteUser,
        isUserModalOpen,
        setIsUserModalOpen,
        editingUser,
        setEditingUser,
        photoGalleryJob,
        setPhotoGalleryJob,
        clients,
        appointments,
        jobs,
        deliveries,
        expenses,
        servicesConfig,
        expenseCategories,
        businessProfile,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isAppointmentModalOpen,
        setIsAppointmentModalOpen,
        editingAppointment,
        setEditingAppointment,
        isJobModalOpen,
        setIsJobModalOpen,
        editingJob,
        setEditingJob,
        isClientModalOpen,
        setIsClientModalOpen,
        editingClient,
        setEditingClient,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        editingExpense,
        setEditingExpense,
        isDeliveryModalOpen,
        setIsDeliveryModalOpen,
        editingDelivery,
        setEditingDelivery,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        duplicateAppointment,
        addJob,
        updateJob,
        updateJobStatus,
        deleteJob,
        addDelivery,
        updateDelivery,
        deleteDelivery,
        addClient,
        updateClient,
        deleteClient,
        addExpense,
        updateExpense,
        deleteExpense,
        updateServicesConfig,
        addExpenseCategory,
        updateBusinessProfile,
        resetData,
        reloadAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
