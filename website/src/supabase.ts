import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);
export const supabase = createClient(
  url || "http://127.0.0.1:54321",
  key || "configuration-missing",
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);
