/**
 * Placeholder types for Supabase auto-generated types.
 *
 * When ready, run `supabase gen types typescript --project-id your-project-id > src/types/supabase.ts`
 * and replace the `Database` type below with the generated types.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = unknown;

export type SupabaseUser = {
  id: string;
  email?: string | null;
  aud?: string | null;
};
