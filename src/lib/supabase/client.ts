import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

console.log('DEBUG SUPABASE:', { 
  url, 
  keyPresent: !!anonKey 
});

if (!url || !anonKey) {
  console.error('Supabase vars missing!');
}

export const supabaseClient = createBrowserClient<Database>(url, anonKey);

export default supabaseClient;
