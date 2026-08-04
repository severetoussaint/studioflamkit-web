import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createBrowserClient<Database>(
  url,
  anonKey
);

export default supabaseClient;
