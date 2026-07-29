import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

if (!url || !anonKey) {
  // Warning only: during development this helps identify missing env vars.
  // Do not throw here to avoid breaking builds before env is configured.
  // Production runtime will fail fast if keys are missing when attempting requests.
  // eslint-disable-next-line no-console
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Browser client for Supabase — intended for client-side usage only.
 * Uses only public environment variables (NEXT_PUBLIC_*).
 * Never use service_role or server-only keys here.
 */
export const supabaseClient = createClient<Database>(url, anonKey, {
  auth: {
    // We don't persist sessions via localStorage here; the app can opt-in as needed.
    persistSession: false,
  },
});

export default supabaseClient;
