import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

// Only create a real client if credentials exist; otherwise use a dummy
let supabase: SupabaseClient;

if (hasCredentials) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase credentials missing — running in offline/localStorage mode.");
  // Create a no-op client that won't crash but won't do anything
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase, hasCredentials };
