import {
  Client,
  Appointment,
  Job,
  DeliveryItem,
  Expense,
  ServicePriceConfig,
  BusinessProfile,
  AppUser
} from '../types';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  CLIENTS: 'immophoto_clients',
  APPOINTMENTS: 'immophoto_appointments',
  JOBS: 'immophoto_jobs',
  DELIVERIES: 'immophoto_deliveries',
  EXPENSES: 'immophoto_expenses',
  SERVICES_CONFIG: 'immophoto_services_config',
  BUSINESS_PROFILE: 'immophoto_business_profile',
  EXPENSE_CATEGORIES: 'immophoto_expense_categories',
  USERS: 'immophoto_users',
  CURRENT_USER_ID: 'immophoto_current_user_id',
  AUTH_USER: 'immophoto_auth_user',
};

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'usr-1',
    name: 'Marco Bellini',
    email: 'marco.bellini.photo@gmail.com',
    password: 'password123',
    phone: '+39 347 1234567',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    color: '#2563eb',
    active: true,
    notes: 'Fondatore e fotografo principale dello studio.',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Federico Galli',
    email: 'f.galli.drone@gmail.com',
    password: 'password123',
    phone: '+39 339 9988776',
    role: 'photographer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    color: '#0284c7',
    active: true,
    notes: 'Operatore video cinematico e pilota drone abilitato ENAC.',
    createdAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'usr-3',
    name: 'Elena Ronchi',
    email: 'elena.editing.pro@gmail.com',
    password: 'password123',
    phone: '+39 345 5544332',
    role: 'editor',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    color: '#9333ea',
    active: true,
    notes: 'Specialista fotoritocco HDR, decluttering digitale e montaggio reel.',
    createdAt: '2026-05-10T11:00:00Z'
  },
  {
    id: 'usr-4',
    name: 'Luca Moretti',
    email: 'l.moretti.assistant@gmail.com',
    password: 'password123',
    phone: '+39 333 1122334',
    role: 'collaborator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    color: '#10b981',
    active: true,
    notes: 'Collaboratore su Milano est e Monza per servizi fotografici standard.',
    createdAt: '2026-08-01T14:00:00Z'
  }
];

export const DEFAULT_SERVICE_CONFIGS: ServicePriceConfig[] = [
  {
    id: 'srv-1',
    name: 'Servizio fotografico',
    defaultPrice: 220,
    defaultPhotos: 25,
    defaultVideos: 0,
    description: 'Servizio fotografico HDR per interni ed esterni, grandangolo, fotoritocco professionale.'
  },
  {
    id: 'srv-2',
    name: 'Fotografia + video',
    defaultPrice: 380,
    defaultPhotos: 30,
    defaultVideos: 1,
    description: 'Fotografie complete + video reel cinematico verticale (9:16) e orizzontale (16:9).'
  },
  {
    id: 'srv-3',
    name: 'Video immobiliare',
    defaultPrice: 280,
    defaultPhotos: 0,
    defaultVideos: 1,
    description: 'Video tour dinamico con musica licenziata, stabilizzatore gimbal e montaggio professionale.'
  },
  {
    id: 'srv-4',
    name: 'Foto + video + drone',
    defaultPrice: 520,
    defaultPhotos: 35,
    defaultVideos: 2,
    description: 'Pacchetto premium completo di riprese aeree autorizzate con pilota certificato ENAC.'
  },
  {
    id: 'srv-5',
    name: 'Virtual tour',
    defaultPrice: 300,
    defaultPhotos: 15,
    defaultVideos: 0,
    description: 'Scansione 360° interattiva per Matterport o Google Street View.'
  },
  {
    id: 'srv-6',
    name: 'Servizio personalizzato',
    defaultPrice: 450,
    defaultPhotos: 40,
    defaultVideos: 1,
    description: 'Servizio su misura per residenze di lusso, ville d\'epoca o cantieri.'
  }
];

export const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  'Carburante',
  'Autostrada e parcheggi',
  'Attrezzatura fotografica',
  'Manutenzione attrezzatura',
  'Software e abbonamenti',
  'Collaboratori',
  'Pubblicità',
  'Altre spese'
];

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  photographerName: 'Marco Bellini',
  studioName: 'Home Frame - Fotografia & Video Immobiliare',
  vatNumber: 'IT 09876543210',
  fiscalCode: 'BLLMRC88T15F205K',
  phone: '+39 347 1234567',
  email: 'marco.bellini.photo@gmail.com',
  address: 'Via Montenapoleone 8, 20121 Milano (MI)',
  iban: 'IT60X0542811101000000123456',
  bankName: 'Intesa Sanpaolo',
  notes: 'Esente IVA regime forfettario art. 1, commi 54-89, L. 190/2014.'
};

// Generatore di dati di esempio realistici per l'avvio immediato
export function getInitialSeedData() {
  const clients: Client[] = [
    {
      id: 'cli-1',
      fullName: 'Alessandro Conti',
      agency: 'Engel & Völkers Milano Centro',
      phone: '+39 335 8899123',
      email: 'a.conti@evmilano.it',
      address: 'Corso Venezia 14, Milano',
      notes: 'Cliente abituale, richiede sempre foto a luce naturale e video reel Instagram.',
      createdAt: '2026-09-10T10:00:00Z'
    },
    {
      id: 'cli-2',
      fullName: 'Serena Marchesi',
      agency: 'Gabetti Porta Romana',
      phone: '+39 349 7722456',
      email: 's.marchesi@gabettiportaromana.it',
      address: 'Corso di Porta Romana 82, Milano',
      notes: 'Puntuale nei pagamenti con bonifico istantaneo.',
      createdAt: '2026-10-02T14:30:00Z'
    },
    {
      id: 'cli-3',
      fullName: 'Matteo Riva',
      agency: 'Remax Skyline',
      phone: '+39 338 4411990',
      email: 'mriva@remaxskyline.it',
      address: 'Via Melchiorre Gioia 45, Milano',
      notes: 'Tratta principalmente appartamenti di pregio e attici.',
      createdAt: '2026-10-15T09:15:00Z'
    },
    {
      id: 'cli-4',
      fullName: 'Giulia Villa',
      agency: 'Case Vacanza Lake Como',
      phone: '+39 340 1299887',
      email: 'info@lakecomovillas.com',
      address: 'Viale Geno 12, Como',
      notes: 'Gestisce ville per affitti brevi di lusso. Richiede anche riprese drone.',
      createdAt: '2026-10-20T11:00:00Z'
    }
  ];

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const getDateStr = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const appointments: Appointment[] = [
    {
      id: 'app-1',
      clientId: 'cli-1',
      clientName: 'Alessandro Conti',
      agency: 'Engel & Völkers Milano Centro',
      phone: '+39 335 8899123',
      email: 'a.conti@evmilano.it',
      propertyAddress: 'Via della Spiga 22, Milano',
      date: todayStr,
      time: '10:30',
      propertyType: 'Attico',
      squareMeters: 180,
      rooms: 4,
      serviceType: 'Fotografia + video',
      agreedPrice: 380,
      deposit: 100,
      notes: 'Attico con terrazzo panoramico vista Duomo. Portare ottica grandangolare 16-35mm.',
      specialRequests: 'Fare riprese video al tramonto o luce del mattino.',
      status: 'confermato',
      jobId: 'job-1',
      assignedUserId: 'usr-1',
      createdAt: '2026-11-10T09:00:00Z'
    },
    {
      id: 'app-2',
      clientId: 'cli-2',
      clientName: 'Serena Marchesi',
      agency: 'Gabetti Porta Romana',
      phone: '+39 349 7722456',
      email: 's.marchesi@gabettiportaromana.it',
      propertyAddress: 'Via Quadronno 18, Milano',
      date: todayStr,
      time: '15:00',
      propertyType: 'Appartamento',
      squareMeters: 95,
      rooms: 3,
      serviceType: 'Servizio fotografico',
      agreedPrice: 220,
      deposit: 0,
      notes: 'Appartamento appena ristrutturato, chiavi dal custode scala B.',
      specialRequests: 'Particolare attenzione alla cucina e alle finiture in marmo.',
      status: 'confermato',
      jobId: 'job-2',
      assignedUserId: 'usr-4',
      createdAt: '2026-11-11T11:00:00Z'
    },
    {
      id: 'app-3',
      clientId: 'cli-4',
      clientName: 'Giulia Villa',
      agency: 'Case Vacanza Lake Como',
      phone: '+39 340 1299887',
      email: 'info@lakecomovillas.com',
      propertyAddress: 'Via Regina 45, Cernobbio (CO)',
      date: getDateStr(2),
      time: '11:00',
      propertyType: 'Villa / Casale',
      squareMeters: 320,
      rooms: 7,
      serviceType: 'Foto + video + drone',
      agreedPrice: 520,
      deposit: 150,
      notes: 'Villa fronte lago con molo privato e piscina a sfioro. Portare drone DJI Mavic 3.',
      specialRequests: 'Clip drone aeree per promozione su portali esteri.',
      status: 'confermato',
      jobId: 'job-3',
      assignedUserId: 'usr-2',
      createdAt: '2026-11-12T16:00:00Z'
    },
    {
      id: 'app-4',
      clientId: 'cli-3',
      clientName: 'Matteo Riva',
      agency: 'Remax Skyline',
      phone: '+39 338 4411990',
      email: 'mriva@remaxskyline.it',
      propertyAddress: 'Viale Monte Grappa 10, Milano',
      date: getDateStr(4),
      time: '14:30',
      propertyType: 'Appartamento',
      squareMeters: 120,
      rooms: 3,
      serviceType: 'Virtual tour',
      agreedPrice: 300,
      deposit: 0,
      notes: 'Appartamento open space piano alto Bosco Verticale.',
      specialRequests: 'Virtual tour per acquirenti internazionali.',
      status: 'confermato',
      jobId: 'job-4',
      assignedUserId: 'usr-1',
      createdAt: '2026-11-13T10:00:00Z'
    }
  ];

  const jobs: Job[] = [
    {
      id: 'job-1',
      appointmentId: 'app-1',
      clientId: 'cli-1',
      clientName: 'Alessandro Conti',
      agency: 'Engel & Völkers Milano Centro',
      phone: '+39 335 8899123',
      email: 'a.conti@evmilano.it',
      propertyAddress: 'Via della Spiga 22, Milano',
      shootDate: todayStr,
      propertyType: 'Attico',
      serviceType: 'Fotografia + video',
      expectedPhotos: 30,
      expectedVideos: 1,
      workNotes: 'Effettuare scatti grandangolari + video reel per Instagram.',
      targetDeliveryDate: getDateStr(3),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-spiga22',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      notes: 'Confermata presenza dell\'agente alle 10:30.',
      status: '2_da_effettuare',
      assignedPhotographerId: 'usr-1',
      assignedEditorId: 'usr-3',
      price: 380,
      deposit: 100,
      balance: 280,
      paymentMethod: 'Bonifico',
      paymentStatus: 'acconto_ricevuto',
      paymentDate: getDateStr(-2),
      createdAt: '2026-11-10T09:00:00Z',
      updatedAt: '2026-11-14T10:00:00Z'
    },
    {
      id: 'job-2',
      appointmentId: 'app-2',
      clientId: 'cli-2',
      clientName: 'Serena Marchesi',
      agency: 'Gabetti Porta Romana',
      phone: '+39 349 7722456',
      email: 's.marchesi@gabettiportaromana.it',
      propertyAddress: 'Via Quadronno 18, Milano',
      shootDate: todayStr,
      propertyType: 'Appartamento',
      serviceType: 'Servizio fotografico',
      expectedPhotos: 25,
      expectedVideos: 0,
      workNotes: 'Servizio standard HDR 25 scatti.',
      targetDeliveryDate: getDateStr(2),
      cloudFolderUrl: 'https://www.dropbox.com/sh/demo-quadronno18',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=600&q=80',
      status: '2_da_effettuare',
      assignedPhotographerId: 'usr-4',
      assignedEditorId: 'usr-3',
      price: 220,
      deposit: 0,
      balance: 220,
      paymentMethod: 'Bonifico',
      paymentStatus: 'in_attesa_saldo',
      createdAt: '2026-11-11T11:00:00Z',
      updatedAt: '2026-11-11T11:00:00Z'
    },
    {
      id: 'job-3',
      appointmentId: 'app-3',
      clientId: 'cli-4',
      clientName: 'Giulia Villa',
      agency: 'Case Vacanza Lake Como',
      phone: '+39 340 1299887',
      email: 'info@lakecomovillas.com',
      propertyAddress: 'Via Regina 45, Cernobbio (CO)',
      shootDate: getDateStr(2),
      propertyType: 'Villa / Casale',
      serviceType: 'Foto + video + drone',
      expectedPhotos: 35,
      expectedVideos: 2,
      workNotes: 'Scatti interni villa + riprese drone giardino e lago.',
      targetDeliveryDate: getDateStr(6),
      cloudFolderUrl: '',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      status: '1_confermato',
      assignedPhotographerId: 'usr-2',
      assignedEditorId: 'usr-3',
      price: 520,
      deposit: 150,
      balance: 370,
      paymentMethod: 'Bonifico',
      paymentStatus: 'acconto_ricevuto',
      createdAt: '2026-11-12T16:00:00Z',
      updatedAt: '2026-11-12T16:00:00Z'
    },
    {
      id: 'job-past-1',
      clientId: 'cli-3',
      clientName: 'Matteo Riva',
      agency: 'Remax Skyline',
      phone: '+39 338 4411990',
      email: 'mriva@remaxskyline.it',
      propertyAddress: 'Piazza Gae Aulenti 4, Milano',
      shootDate: getDateStr(-3),
      propertyType: 'Appartamento',
      serviceType: 'Fotografia + video',
      expectedPhotos: 30,
      expectedVideos: 1,
      workNotes: 'Video verticale per social media + 30 foto ad alta risoluzione.',
      targetDeliveryDate: getDateStr(1),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-gaeaulenti',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
      status: '5_editing',
      assignedPhotographerId: 'usr-1',
      assignedEditorId: 'usr-3',
      price: 400,
      deposit: 150,
      balance: 250,
      paymentMethod: 'Bonifico',
      paymentStatus: 'acconto_ricevuto',
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-13T18:00:00Z'
    },
    {
      id: 'job-past-2',
      clientId: 'cli-1',
      clientName: 'Alessandro Conti',
      agency: 'Engel & Völkers Milano Centro',
      phone: '+39 335 8899123',
      email: 'a.conti@evmilano.it',
      propertyAddress: 'Via San Babila 5, Milano',
      shootDate: getDateStr(-6),
      propertyType: 'Attico',
      serviceType: 'Servizio personalizzato',
      expectedPhotos: 40,
      expectedVideos: 1,
      workNotes: 'Virtual staging e foto notturne con illuminazione d\'atmosfera.',
      targetDeliveryDate: getDateStr(-1),
      actualDeliveryDate: getDateStr(-1),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-sanbabila5',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
      status: '7_consegnato',
      assignedPhotographerId: 'usr-1',
      assignedEditorId: 'usr-3',
      price: 650,
      deposit: 200,
      balance: 450,
      paymentMethod: 'Bonifico',
      paymentStatus: 'in_attesa_saldo',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-14T19:00:00Z'
    },
    {
      id: 'job-past-3',
      clientId: 'cli-2',
      clientName: 'Serena Marchesi',
      agency: 'Gabetti Porta Romana',
      phone: '+39 349 7722456',
      email: 's.marchesi@gabettiportaromana.it',
      propertyAddress: 'Viale Bligny 15, Milano',
      shootDate: getDateStr(-10),
      propertyType: 'Appartamento',
      serviceType: 'Servizio fotografico',
      expectedPhotos: 25,
      expectedVideos: 0,
      workNotes: 'Servizio fotografico completo per bilocale vicino Bocconi.',
      targetDeliveryDate: getDateStr(-7),
      actualDeliveryDate: getDateStr(-8),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-bligny15',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
      status: '8_completato_pagato',
      assignedPhotographerId: 'usr-4',
      assignedEditorId: 'usr-3',
      price: 220,
      deposit: 0,
      balance: 0,
      paymentMethod: 'Carta',
      paymentStatus: 'saldato',
      paymentDate: getDateStr(-7),
      createdAt: '2026-10-28T09:00:00Z',
      updatedAt: '2026-11-05T14:00:00Z'
    }
  ];

  const deliveries: DeliveryItem[] = [
    {
      id: 'del-1',
      jobId: 'job-past-1',
      clientName: 'Matteo Riva',
      agency: 'Remax Skyline',
      propertyAddress: 'Piazza Gae Aulenti 4, Milano',
      shootDate: getDateStr(-3),
      targetDeliveryDate: getDateStr(1),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-gaeaulenti',
      materialDelivered: '30 Fotografie HDR + 1 Video Reel 4K',
      status: 'in_lavorazione',
      notes: 'Editing del video in finalizzazione con color grading caldo.',
      createdAt: '2026-11-12T10:00:00Z'
    },
    {
      id: 'del-2',
      jobId: 'job-past-2',
      clientName: 'Alessandro Conti',
      agency: 'Engel & Völkers Milano Centro',
      propertyAddress: 'Via San Babila 5, Milano',
      shootDate: getDateStr(-6),
      targetDeliveryDate: getDateStr(-1),
      actualDeliveryDate: getDateStr(-1),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-sanbabila5',
      materialDelivered: '40 Fotografie ad alta risoluzione + Video tour orizzontale',
      status: 'consegnato',
      notes: 'Link inviato via email al cliente. In attesa di approvazione o note.',
      createdAt: '2026-11-14T18:00:00Z'
    },
    {
      id: 'del-3',
      jobId: 'job-past-3',
      clientName: 'Serena Marchesi',
      agency: 'Gabetti Porta Romana',
      propertyAddress: 'Viale Bligny 15, Milano',
      shootDate: getDateStr(-10),
      targetDeliveryDate: getDateStr(-7),
      actualDeliveryDate: getDateStr(-8),
      cloudFolderUrl: 'https://drive.google.com/drive/folders/demo-bligny15',
      materialDelivered: '25 Fotografie web e print',
      status: 'consegnato',
      notes: 'Consegna anticipata completata con successo.',
      createdAt: '2026-11-04T12:00:00Z'
    }
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-1',
      description: 'Pieno carburante Eni Station (Milano - Como)',
      amount: 78.50,
      date: getDateStr(-1),
      category: 'Carburante',
      paymentMethod: 'Carta',
      notes: 'Viaggio per sopralluogo villa a Cernobbio',
      createdAt: '2026-11-14T08:30:00Z'
    },
    {
      id: 'exp-2',
      description: 'Telepass autostrada A9 Milano-Laghi',
      amount: 14.80,
      date: getDateStr(-1),
      category: 'Autostrada e parcheggi',
      paymentMethod: 'Carta',
      createdAt: '2026-11-14T20:00:00Z'
    },
    {
      id: 'exp-3',
      description: 'Abbonamento mensile Adobe Creative Cloud',
      amount: 65.99,
      date: getDateStr(-12),
      category: 'Software e abbonamenti',
      paymentMethod: 'Carta',
      notes: 'Photoshop, Lightroom Classic e Premiere Pro per fotoritocco e montaggio',
      createdAt: '2026-11-03T10:00:00Z'
    },
    {
      id: 'exp-4',
      description: 'Spazio Cloud Google Workspace 2TB',
      amount: 10.40,
      date: getDateStr(-15),
      category: 'Software e abbonamenti',
      paymentMethod: 'Carta',
      notes: 'Archiviazione cloud e consegna file clienti',
      createdAt: '2026-10-31T09:00:00Z'
    },
    {
      id: 'exp-5',
      description: 'Scheda SD Sony Tough V60 128GB',
      amount: 89.00,
      date: getDateStr(-18),
      category: 'Attrezzatura fotografica',
      paymentMethod: 'Carta',
      notes: 'Backup card per riprese video 4K a 60fps',
      createdAt: '2026-10-28T15:00:00Z'
    },
    {
      id: 'exp-6',
      description: 'Campagna Instagram Ads per acquisizione agenzie',
      amount: 120.00,
      date: getDateStr(-22),
      category: 'Pubblicità',
      paymentMethod: 'PayPal / Stripe',
      notes: 'Target Milano e Monza agenti immobiliari',
      createdAt: '2026-10-24T11:00:00Z'
    }
  ];

  return { clients, appointments, jobs, deliveries, expenses, users: DEFAULT_USERS };
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Errore caricamento da storage [${key}]:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Errore salvataggio storage [${key}]:`, e);
  }
}

export function ensureInitialData() {
  const existingClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  if (!existingClients) {
    const seed = getInitialSeedData();
    saveToStorage(STORAGE_KEYS.CLIENTS, seed.clients);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, seed.appointments);
    saveToStorage(STORAGE_KEYS.JOBS, seed.jobs);
    saveToStorage(STORAGE_KEYS.DELIVERIES, seed.deliveries);
    saveToStorage(STORAGE_KEYS.EXPENSES, seed.expenses);
  }

  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].id);
  } else {
    // Assicurati che tutti gli utenti abbiano una password predefinita se assente
    try {
      const parsed = JSON.parse(existingUsers) as AppUser[];
      let changed = false;
      parsed.forEach(u => {
        if (!u.password) {
          u.password = 'password123';
          changed = true;
        }
      });
      if (changed) saveToStorage(STORAGE_KEYS.USERS, parsed);
    } catch (e) {
      // ignore
    }
  }

  const existingConfig = localStorage.getItem(STORAGE_KEYS.SERVICES_CONFIG);
  if (!existingConfig) {
    saveToStorage(STORAGE_KEYS.SERVICES_CONFIG, DEFAULT_SERVICE_CONFIGS);
  }

  const existingCategories = localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
  if (!existingCategories) {
    saveToStorage(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES);
  }

  const existingProfile = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILE);
  if (!existingProfile) {
    saveToStorage(STORAGE_KEYS.BUSINESS_PROFILE, DEFAULT_BUSINESS_PROFILE);
  }
}

export function exportDatabaseBackup(): string {
  const backup = {
    version: '1.1',
    exportDate: new Date().toISOString(),
    users: loadFromStorage<AppUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS),
    clients: loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, []),
    appointments: loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []),
    jobs: loadFromStorage<Job[]>(STORAGE_KEYS.JOBS, []),
    deliveries: loadFromStorage<DeliveryItem[]>(STORAGE_KEYS.DELIVERIES, []),
    expenses: loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []),
    servicesConfig: loadFromStorage<ServicePriceConfig[]>(STORAGE_KEYS.SERVICES_CONFIG, DEFAULT_SERVICE_CONFIGS),
    expenseCategories: loadFromStorage<string[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES),
    businessProfile: loadFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESS_PROFILE, DEFAULT_BUSINESS_PROFILE),
  };
  return JSON.stringify(backup, null, 2);
}

export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.users) saveToStorage(STORAGE_KEYS.USERS, parsed.users);
    if (parsed.clients) saveToStorage(STORAGE_KEYS.CLIENTS, parsed.clients);
    if (parsed.appointments) saveToStorage(STORAGE_KEYS.APPOINTMENTS, parsed.appointments);
    if (parsed.jobs) saveToStorage(STORAGE_KEYS.JOBS, parsed.jobs);
    if (parsed.deliveries) saveToStorage(STORAGE_KEYS.DELIVERIES, parsed.deliveries);
    if (parsed.expenses) saveToStorage(STORAGE_KEYS.EXPENSES, parsed.expenses);
    if (parsed.servicesConfig) saveToStorage(STORAGE_KEYS.SERVICES_CONFIG, parsed.servicesConfig);
    if (parsed.expenseCategories) saveToStorage(STORAGE_KEYS.EXPENSE_CATEGORIES, parsed.expenseCategories);
    if (parsed.businessProfile) saveToStorage(STORAGE_KEYS.BUSINESS_PROFILE, parsed.businessProfile);
    return true;
  } catch (err) {
    console.error('Errore importazione backup:', err);
    return false;
  }
}

export function resetToSeedData() {
  const seed = getInitialSeedData();
  saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].id);
  saveToStorage(STORAGE_KEYS.CLIENTS, seed.clients);
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, seed.appointments);
  saveToStorage(STORAGE_KEYS.JOBS, seed.jobs);
  saveToStorage(STORAGE_KEYS.DELIVERIES, seed.deliveries);
  saveToStorage(STORAGE_KEYS.EXPENSES, seed.expenses);
  saveToStorage(STORAGE_KEYS.SERVICES_CONFIG, DEFAULT_SERVICE_CONFIGS);
  saveToStorage(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES);
  saveToStorage(STORAGE_KEYS.BUSINESS_PROFILE, DEFAULT_BUSINESS_PROFILE);
}

export { STORAGE_KEYS };
