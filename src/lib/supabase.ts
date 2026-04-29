// Phase I — Supabase client singleton.
// Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment.
// Never uses service_role key on the frontend.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/**
 * True when both env vars are set.
 * Components use this to decide whether to attempt real API calls
 * or fall back to demo data gracefully.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let _client: SupabaseClient | null = null;

/**
 * Lazily-created Supabase client.
 * Returns `null` when env vars are missing (dev without backend).
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}
