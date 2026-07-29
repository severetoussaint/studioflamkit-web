import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// SERVICE ROLE MUST BE SERVER-ONLY. Do NOT fallback to anon key here.
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!url || !serviceRole) {
  // eslint-disable-next-line no-console
  console.warn('Missing Supabase server-side environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
}

/**
 * Create a Supabase client tailored for server-side (Server Components / Route Handlers)
 * 
 * This function initializes a Supabase client using a server-only key when available
 * and attempts to hydrate it with an access token extracted from the request cookies (if present).
 *
 * Important:
 * - Use service role key for server-only privileged operations (keep it secret).
 * - For requests that should act on behalf of a user, prefer using
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
    // Common cookie names that may hold Supabase session/token — kept generic for future wiring.
    const token =
      cookieJar.get('sb-access-token')?.value ??
      cookieJar.get('sb:token')?.value ??
      cookieJar.get('supabase-auth-token')?.value ??
      null;

    if (token) {
      // If setAuth is available in runtime, set the auth token so requests run as the user.
      // This is a guarded call to avoid runtime errors in environments where API differs.
      // @ts-expect-error - setAuth may not be present in all versions/types; this is for future wiring.
      if (typeof (supabase.auth as any)?.setAuth === 'function') {
        (supabase.auth as any).setAuth(token);
      }
    }
  } catch (e) {
    // If cookie parsing fails, continue silently — client remains unauthenticated.
  }

  return supabase;
}

export default createServerSupabaseClient;
