import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Client-side override check for ease of maintenance
if (typeof window !== 'undefined') {
  const localSettings = JSON.parse(localStorage.getItem('sb-sandbox-settings') || '{}');
  if (localSettings.supabase_url) supabaseUrl = localSettings.supabase_url;
  if (localSettings.supabase_anon_key) supabaseAnonKey = localSettings.supabase_anon_key;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

