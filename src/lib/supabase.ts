import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-created Supabase browser client. We do NOT create it at module load,
 * so the app runs fine on the mock backend with no Supabase env vars set.
 * The first call to getSupabase() will throw a clear error if keys are missing.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase is selected (VITE_DATA_SOURCE=supabase) but VITE_SUPABASE_URL / " +
        "VITE_SUPABASE_ANON_KEY are not set. Add them to .env.local."
    );
  }
  client = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
