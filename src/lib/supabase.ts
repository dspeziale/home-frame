import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'immophoto_supabase_url';
const SUPABASE_ANON_KEY = 'immophoto_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(SUPABASE_ANON_KEY) || envKey;
  
  return { url: storedUrl, anonKey: storedKey };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
  _client = null; // reset client instance
}

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey) {
    try {
      _client = createClient(url, anonKey);
      return _client;
    } catch (e) {
      console.warn('Errore inizializzazione Supabase client:', e);
      return null;
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, anonKey);
    const { error } = await tempClient.from('clients').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, connection is valid but tables need creation
      if (error.message.includes('relation "public.clients" does not exist') || error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connessione a Supabase riuscita! Le tabelle non sono ancora state create. Usa lo script SQL generato in Impostazioni per crearle con un click.' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connessione e sincronizzazione Supabase attive!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Errore di connessione a Supabase' };
  }
}
