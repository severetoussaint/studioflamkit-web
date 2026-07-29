import { cookies } from 'next/headers';

/**
 * Middleware helpers for session handling.
 *
 * This file provides lightweight utilities that will be used later to implement
 * route protection, session parsing and refresh. For now it only exposes helpers
 * that read cookies and return token placeholders.
 *
 * Do NOT implement route protection here yet — this is scaffolding only.
 */

export function getAuthTokenFromCookies(cookieStore?: ReturnType<typeof cookies>) {
  const cookieJar = cookieStore ?? cookies();
  return cookieJar.get('sb-access-token')?.value ?? cookieJar.get('sb:token')?.value ?? cookieJar.get('supabase-auth-token')?.value ?? null;
}

export async function getSessionFromCookies() {
  // Placeholder: returns null for now. Future implementation will validate and
  // return a session object using server-side Supabase client.
  return null;
}
