import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type AuthorRow = Database['public']['Tables']['authors']['Row'];
export type AuthorInsert = Database['public']['Tables']['authors']['Insert'];
export type AuthorUpdate = Database['public']['Tables']['authors']['Update'];

export async function listAuthors() {
  const { data, error } = await supabaseClient.from('authors').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AuthorRow[];
}

export async function getAuthorByUserId(userId: string) {
  const { data, error } = await supabaseClient.from('authors').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as AuthorRow | null;
}

export async function createAuthor(input: AuthorInsert) {
  const { data, error } = await supabaseClient.from('authors').insert(input as never).select().single();
  if (error) throw error;
  return data as AuthorRow | null;
}

export async function updateAuthor(id: string, updates: AuthorUpdate) {
  const { data, error } = await supabaseClient.from('authors').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as AuthorRow | null;
}
