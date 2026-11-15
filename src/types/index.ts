export type PropertyType = 
  | 'Appartamento' 
  | 'Villa / Casale' 
  | 'Attico' 
  | 'Rustico' 
  | 'Negozio / Commerciale' 
  | 'Ufficio' 
  | 'Altro';

export type ServiceType = 
  | 'Servizio fotografico' 
  | 'Fotografia + video' 
  | 'Video immobiliare' 
  | 'Foto + video + drone' 
  | 'Virtual tour' 
  | 'Servizio personalizzato';

export type AppointmentStatus = 'confermato' | 'in_attesa' | 'annullato' | 'completato';

export type JobStatus = 
  | '1_confermato'        // Appuntamento confermato
  | '2_da_effettuare'     // Da effettuare
  | '3_effettuato'        // Servizio fotografico effettuato
  | '4_selezione'         // Materiale da selezionare
  | '5_editing'           // In fase di editing
  | '6_pronto'            // Pronto per la consegna
  | '7_consegnato'        // Consegnato
  | '8_completato_pagato'; // Completato e pagato

export type DeliveryStatus = 
  | 'da_preparare' 
  | 'in_lavorazione' 
  | 'pronto' 
  | 'consegnato' 
  | 'in_attesa_modifiche' 
  | 'modifiche_richieste' 
  | 'nuova_consegna_effettuata';

export type ExpenseCategory = 
  | 'Carburante' 
  | 'Autostrada e parcheggi' 
  | 'Attrezzatura fotografica' 
  | 'Manutenzione attrezzatura' 
  | 'Software e abbonamenti' 
  | 'Collaboratori' 
  | 'Pubblicità' 
  | 'Altre spese'
  | string;

export type PaymentMethod = 'Bonifico' | 'Carta' | 'Contanti' | 'PayPal / Stripe' | 'Altro';

export type PaymentStatus = 'in_attesa_acconto' | 'acconto_ricevuto' | 'in_attesa_saldo' | 'saldato';

export type UserRole = 'admin' | 'photographer' | 'editor' | 'collaborator';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  color?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export type PhotoCategory = 
  | 'Tutte'
  | 'Foto'
  | 'Video & Reel'
  | 'Copertina' 
  | 'Soggiorno' 
  | 'Cucina' 
  | 'Camera' 
  | 'Bagno' 
  | 'Esterni' 
  | 'Terrazzo / Vista' 
  | 'Drone' 
  | 'Dettagli' 
  | 'Altro';

export type MediaType = 'photo' | 'video';

export interface JobPhoto {
  id: string;
  jobId: string;
  name: string;
  size: number;
  type: string;
  mediaType?: MediaType;
  category: PhotoCategory;
  dataUrl: string;
  videoUrl?: string;
  duration?: string;
  isCover?: boolean;
  uploadedAt: string;
}

export interface Client {
  id: string;
  fullName: string;
  agency?: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  agency?: string;
  phone: string;
  email: string;
  propertyAddress: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  propertyType: PropertyType;
  squareMeters: number;
  rooms: number;
  serviceType: ServiceType;
  agreedPrice: number;
  deposit?: number;
  notes?: string;
  specialRequests?: string;
  status: AppointmentStatus;
  jobId?: string;
  assignedUserId?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  appointmentId?: string;
  clientId?: string;
  clientName: string;
  agency?: string;
  phone: string;
  email: string;
  propertyAddress: string;
  shootDate: string;
  propertyType: PropertyType;
  serviceType: ServiceType;
  expectedPhotos: number;
  expectedVideos: number;
  workNotes?: string;
  targetDeliveryDate: string;
  actualDeliveryDate?: string;
  cloudFolderUrl?: string;
  coverPhotoUrl?: string;
  notes?: string;
  status: JobStatus;
  assignedPhotographerId?: string;
  assignedEditorId?: string;
  
  // Financial tracking
  price: number;
  deposit: number;
  balance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryItem {
  id: string;
  jobId: string;
  clientName: string;
  agency?: string;
  propertyAddress: string;
  shootDate: string;
  targetDeliveryDate: string;
  actualDeliveryDate?: string;
  cloudFolderUrl?: string;
  materialDelivered: string;
  status: DeliveryStatus;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  jobId?: string;
  clientId?: string;
  receiptName?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ServicePriceConfig {
  id: string;
  name: ServiceType;
  defaultPrice: number;
  defaultPhotos: number;
  defaultVideos: number;
  description?: string;
}

export interface BusinessProfile {
  photographerName: string;
  studioName: string;
  vatNumber: string;
  fiscalCode?: string;
  phone: string;
  email: string;
  address: string;
  iban?: string;
  bankName?: string;
  logoUrl?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  date: string;
  linkTab?: string;
  itemId?: string;
  read: boolean;
}
