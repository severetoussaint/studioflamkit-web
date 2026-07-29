import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Prefer a server-only key when available (SERVICE ROLE). Fallback to anon key if not set.
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !serviceRole) {
  // eslint-disable-next-line no-console
  console.warn('Missing Supabase server-side environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
}

/**
 * Create a Supabase client tailored for server-side (Server Components / Route Handlers)
 * 
 * This function attempts to initialize a Supabase client using a server-only key
 * and to hydrate it with an access token extracted from the request cookies (if present).
 *
 * Important:
 * - Use service role key for server-only privileged operations (keep it secret).
 * - For regular server requests that should act on behalf of a user, prefer using
 *   the user's session token (extracted from cookies) instead of the service role.
 */
export function createServerSupabaseClient(cookieStore?: ReturnType<typeof cookies>): SupabaseClient {
  const supabase = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch,
    },
  });

  try {
    const cookieJar = cookieStore ?? cookies();
    // Supabase client sets session via setAuth (if token is present). The cookie name
    // used by Supabase JS is typically "sb:token" or similar; adjust when integrating.
    const token = cookieJar.get('sb-access-token')?.value ?? cookieJar.get('sb:token')?.value ?? cookieJar.get('supabase-auth-token')?.value;
    if (token) {
      // Set the auth token for requests made with this client so actions run as the user.
      // Note: supabase.auth.setAuth exists in supabase-js v2.
      // We keep this guarded as a no-op if it does not exist yet in the runtime.
      // @ts-expect-error - setAuth may not exist in all environments; placeholder for future wiring.
      if (typeof (supabase.auth as any)?.setAuth === 'function') {
        (supabase.auth as any).setAuth(token);
      }
    }
  } catch (e) {
    // If cookie parsing fails, we silently continue — the client remains unauthenticated.
  }

  return supabase;
}

export default createServerSupabaseClient;
