import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServicePriceConfig, BusinessProfile, ServiceType } from '../../types';
import { 
  Settings, 
  User, 
  Building2, 
  Tag, 
  Euro, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Moon,
  Sun,
  ShieldCheck,
  Code
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';
import { exportDatabaseBackup, importDatabaseBackup } from '../../lib/storage';
import { downloadFile } from '../../lib/exportUtils';

export const SettingsManager: React.FC = () => {
  const { 
    servicesConfig, 
    updateServicesConfig, 
    expenseCategories, 
    addExpenseCategory, 
    businessProfile, 
    updateBusinessProfile,
    darkMode,
    toggleDarkMode,
    resetData,
    reloadAllData
  } = useApp();

  // Profile Form state
  const [profileForm, setProfileForm] = useState<BusinessProfile>(businessProfile);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Services state
  const [services, setServices] = useState<ServicePriceConfig[]>(servicesConfig);
  const [isServicesSaved, setIsServicesSaved] = useState(false);

  // New category state
  const [newCategory, setNewCategory] = useState('');

  // Supabase config state
  const stored = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(stored.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(stored.anonKey);
  const [supabaseStatus, setSupabaseStatus] = useState<{ testing: boolean; message?: string; success?: boolean }>({ testing: false });

  // SQL Script display
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSchema = `-- SCRIPT SQL PER SUPABASE (Copia e incolla nell'SQL Editor di Supabase)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  agency TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  agency TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  property_address TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  property_type TEXT NOT NULL,
  square_meters NUMERIC DEFAULT 0,
  rooms NUMERIC DEFAULT 1,
  service_type TEXT NOT NULL,
  agreed_price NUMERIC DEFAULT 0,
  deposit NUMERIC DEFAULT 0,
  notes TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'confermato',
  job_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  agency TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  property_address TEXT NOT NULL,
  shoot_date DATE NOT NULL,
  property_type TEXT NOT NULL,
  service_type TEXT NOT NULL,
  expected_photos INTEGER DEFAULT 25,
  expected_videos INTEGER DEFAULT 0,
  work_notes TEXT,
  target_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  cloud_folder_url TEXT,
  notes TEXT,
  status TEXT DEFAULT '1_confermato',
  price NUMERIC DEFAULT 0,
  deposit NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Bonifico',
  payment_status TEXT DEFAULT 'in_attesa_acconto',
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  agency TEXT,
  property_address TEXT NOT NULL,
  shoot_date DATE NOT NULL,
  target_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  cloud_folder_url TEXT,
  material_delivered TEXT,
  status TEXT DEFAULT 'da_preparare',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  receipt_name TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso completo anon/auth ai clienti" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth agli appuntamenti" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth ai lavori" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth alle consegne" ON public.deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth alle spese" ON public.expenses FOR ALL USING (true) WITH CHECK (true);`;

  // Salva Profilo Studio
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(profileForm);
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2500);
  };

  // Salva Listino Prezzi
  const handleSaveServices = (e: React.FormEvent) => {
    e.preventDefault();
    updateServicesConfig(services);
    setIsServicesSaved(true);
    setTimeout(() => setIsServicesSaved(false), 2500);
  };

  // Aggiungi nuova Categoria Spesa
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addExpenseCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  // Test e Salva Connessione Supabase
  const handleTestAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      alert('Inserisci l\'URL e la chiave Anon del tuo progetto Supabase.');
      return;
    }

    setSupabaseStatus({ testing: true });
    saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setSupabaseStatus({ testing: false, success: res.success, message: res.message });
  };

  // Esporta Backup JSON
  const handleExportBackup = () => {
    const json = exportDatabaseBackup();
    const filename = `ImmoPhoto_Backup_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importa Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseBackup(content);
        if (ok) {
          alert('Backup ripristinato con successo!');
          reloadAllData();
        } else {
          alert('Errore nel formato del file di backup.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Impostazioni Studio & Sincronizzazione Cloud
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Personalizzazione listino prezzi, dati aziendali, categorie di spesa e sincronizzazione Supabase
        </p>
      </div>

      {/* 1. PROFILO STUDIO FOTOGRAFICO (INTESTAZIONE RICEVUTE E PDF) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Anagrafica Studio & Dati Fiscali
            </h3>
          </div>
          {isProfileSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Dati salvati con successo!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome e Cognome Fotografo
              </label>
              <input
                type="text"
                value={profileForm.photographerName}
                onChange={e => setProfileForm({ ...profileForm, photographerName: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome dello Studio / Brand
              </label>
              <input
                type="text"
                value={profileForm.studioName}
                onChange={e => setProfileForm({ ...profileForm, studioName: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Partita IVA
              </label>
              <input
                type="text"
                value={profileForm.vatNumber}
                onChange={e => setProfileForm({ ...profileForm, vatNumber: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Codice Fiscale
              </label>
              <input
                type="text"
                value={profileForm.fiscalCode || ''}
                onChange={e => setProfileForm({ ...profileForm, fiscalCode: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefono Studio
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Studio
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Indirizzo Sede / Studio
              </label>
              <input
                type="text"
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Codice IBAN per Bonifici
              </label>
              <input
                type="text"
                value={profileForm.iban || ''}
                onChange={e => setProfileForm({ ...profileForm, iban: e.target.value })}
                placeholder="IT00X0000000000000000000000"
                className="w-full py-2 px-3 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Istituto Bancario
              </label>
              <input
                type="text"
                value={profileForm.bankName || ''}
                onChange={e => setProfileForm({ ...profileForm, bankName: e.target.value })}
                placeholder="Nome banca"
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note Legali / Dicitura Fiscale (mostrate in calce alla scheda PDF)
              </label>
              <textarea
                rows={2}
                value={profileForm.notes || ''}
                onChange={e => setProfileForm({ ...profileForm, notes: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Salva Dati Studio
            </button>
          </div>
        </form>
      </div>

      {/* 2. LISTINO PREZZI DEI SERVIZI FOTOGRAFICI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Personalizzazione Listino Servizi & Prezzi Base
            </h3>
          </div>
          {isServicesSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Listino aggiornato!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveServices} className="space-y-4">
          <div className="space-y-3">
            {services.map((srv, idx) => (
              <div 
                key={srv.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{srv.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{srv.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24">
                    <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Prezzo (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={srv.defaultPrice}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setServices(prev => prev.map((s, i) => i === idx ? { ...s, defaultPrice: val } : s));
                      }}
                      className="w-full py-1.5 px-2.5 font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Foto Base</label>
                    <input
                      type="number"
                      min="0"
                      value={srv.defaultPhotos}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setServices(prev => prev.map((s, i) => i === idx ? { ...s, defaultPhotos: val } : s));
                      }}
                      className="w-full py-1.5 px-2.5 font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Video Base</label>
                    <input
                      type="number"
                      min="0"
                      value={srv.defaultVideos}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setServices(prev => prev.map((s, i) => i === idx ? { ...s, defaultVideos: val } : s));
                      }}
                      className="w-full py-1.5 px-2.5 font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Salva Listino Prezzi
            </button>
          </div>
        </form>
      </div>

      {/* 3. CATEGORIE DI SPESA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <Tag className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Categorie di Spesa Attività
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map(cat => (
              <span 
                key={cat}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-md pt-2">
            <input
              type="text"
              placeholder="Nuova categoria (es. Noleggio Drone, Tasse)..."
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="flex-1 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all"
            >
              Aggiungi
            </button>
          </div>
        </div>
      </div>

      {/* 4. SINCRONIZZAZIONE ONLINE SUPABASE (DATABASE & ACCESSO MULTI-DEVICE) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Sincronizzazione Cloud Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-500">
                Collega il tuo database online gratuito per sincronizzare telefono e computer
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
            Attivo & Predisposto
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project URL Supabase
              </label>
              <input
                type="url"
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestAndSaveSupabase}
              disabled={supabaseStatus.testing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              {supabaseStatus.testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Testa & Salva Connessione</span>
            </button>

            <button
              onClick={() => setShowSql(!showSql)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>{showSql ? 'Nascondi Script SQL' : 'Visualizza Script SQL Tabelle'}</span>
            </button>
          </div>

          {/* Test Status feedback */}
          {supabaseStatus.message && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              supabaseStatus.success 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {supabaseStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{supabaseStatus.message}</span>
            </div>
          )}

          {/* SQL Editor Code display */}
          {showSql && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-slate-400">Schema PostgreSQL per Supabase SQL Editor:</span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copiato!' : 'Copia SQL'}</span>
                </button>
              </div>
              <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                {sqlSchema}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 5. BACKUP, RIPRISTINO & RESET DATI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
          Backup, Esportazione Completa & Ripristino
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Scarica una copia di sicurezza di tutti i clienti, appuntamenti, schede lavoro e spese sul tuo computer
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Scarica Backup Completo (.json)</span>
          </button>

          <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Ripristina da File Backup (.json)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Sei sicuro di voler ripristinare i dati demo di esempio? Le modifiche non salvate andranno perse.')) {
                resetData();
                alert('Dati dimostrativi ripristinati con successo!');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 dark:border-red-900/40 transition-colors ml-auto"
          >
            Ripristina Dati Esempio
          </button>
        </div>
      </div>
    </div>
  );
};
