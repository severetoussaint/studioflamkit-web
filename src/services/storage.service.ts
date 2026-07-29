import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type FileRow = Database['public']['Tables']['files']['Row'];
export type FileInsert = Database['public']['Tables']['files']['Insert'];
export type FileUpdate = Database['public']['Tables']['files']['Update'];

export async function listFiles(projectId: string) {
  const { data, error } = await supabaseClient.from('files').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FileRow[];
}

export async function createFileRecord(input: FileInsert) {
  const { data, error } = await supabaseClient.from('files').insert(input as never).select().single();
  if (error) throw error;
  return data as FileRow | null;
}

export async function updateFileRecord(id: string, updates: FileUpdate) {
  const { data, error } = await supabaseClient.from('files').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as FileRow | null;
}
