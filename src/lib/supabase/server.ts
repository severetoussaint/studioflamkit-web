import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
// SERVICE ROLE MUST BE SERVER-ONLY. Do NOT fallback to anon key here.
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-role';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

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
export async function createServerSupabaseClient(cookieStore?: CookieStore | Promise<CookieStore>) {
  const supabase = createClient<Database>(url, serviceRole, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch,
    },
  });

  try {
    const cookieJar = cookieStore ? await cookieStore : await cookies();
    // Common cookie names that may hold Supabase session/token — kept generic for future wiring.
    const token =
      cookieJar.get('sb-access-token')?.value ??
      cookieJar.get('sb:token')?.value ??
      cookieJar.get('supabase-auth-token')?.value ??
      null;

    if (token) {
      const authWithSetAuth = supabase.auth as typeof supabase.auth & { setAuth?: (token: string) => void };
      if (typeof authWithSetAuth.setAuth === 'function') {
        authWithSetAuth.setAuth(token);
      }
    }
  } catch {
    // If cookie parsing fails, continue silently — client remains unauthenticated.
  }

  return supabase;
}

export default createServerSupabaseClient;
