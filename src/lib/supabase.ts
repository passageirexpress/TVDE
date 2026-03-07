import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
}

// Dummy JWT for placeholder mode to avoid 'atob' errors in supabase-js
const DUMMY_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY0OTQwMDAsImV4cCI6MjYxNjQ5NDAwMH0.placeholder-signature';

// Use a valid URL format for the placeholder to avoid immediate crashes, 
// but it will fail on actual requests if keys are missing.
export const supabase = createClient(
  supabaseUrl || 'https://sua-empresa.supabase.co',
  supabaseAnonKey || DUMMY_JWT
);
