-- SCHEMA SUPABASE / POSTGRESQL PER IMMOPHOTO STUDIO
-- Esegui questo script nell'SQL Editor del tuo progetto Supabase per creare tutte le tabelle.

-- 1. Tabella Clienti
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

-- 2. Tabella Appuntamenti
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

-- 3. Tabella Lavori (Schede Lavoro)
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

-- 4. Tabella Consegne
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

-- 5. Tabella Spese
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

-- Abilita Row Level Security (RLS) se richiesto o imposta policy anonime per web app
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso completo anon/auth ai clienti" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth agli appuntamenti" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth ai lavori" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth alle consegne" ON public.deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accesso completo anon/auth alle spese" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
