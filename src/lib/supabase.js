import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Critical error that will stop the app in usage but logged clearly
    console.error('FATAL: Missing Supabase Credentials in .env.local');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
