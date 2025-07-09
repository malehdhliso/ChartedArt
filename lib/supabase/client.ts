import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Access variables using import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Basic validation (recommended)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env file with VITE_ prefix");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);