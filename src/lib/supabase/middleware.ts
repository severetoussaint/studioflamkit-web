/**
 * Supabase Auth Middleware placeholder for Next.js integration.
 *
 * This file intentionally does not implement cookie reading or middleware logic yet.
 * It serves as a documented placeholder where session-handling utilities will be
 * implemented in a future phase (e.g., reading HttpOnly cookies, refreshing tokens,
 * or wiring Supabase auth helpers).
 *
 * Rules for future implementation:
 * - Do not perform client-side cookie access here.
 * - Implement cookie parsing using server-only APIs (e.g., next/headers) inside server code paths.
 * - Ensure service_role keys are never used for user-scoped requests; prefer session tokens.
 */

export function getAuthTokenFromCookies() {
  // Placeholder: do not implement cookie reading here yet.
  return null;
}

export async function getSessionFromCookies() {
  // Placeholder: will eventually return session details using server-side Supabase client.
  return null;
}
