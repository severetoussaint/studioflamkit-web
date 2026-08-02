import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];
export type ManuscriptInsert = Database['public']['Tables']['manuscripts']['Insert'];
export type ManuscriptUpdate = Database['public']['Tables']['manuscripts']['Update'];

export async function listProjects() {
  const { data, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function createProject(input: ProjectInsert) {
  const { data, error } = await supabaseClient.from('projects').insert(input as never).select().single();
  if (error) throw error;
  return data as ProjectRow | null;
}

export async function updateProject(id: string, updates: ProjectUpdate) {
  const { data, error } = await supabaseClient.from('projects').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as ProjectRow | null;
}

export async function updateProjectStatus(id: string, status: ProjectRow['status']) {
  return updateProject(id, { status, updated_at: new Date().toISOString() });
}

export async function listManuscriptsByAuthor(authorId: string) {
  const { data, error } = await supabaseClient.from('manuscripts').select('*').eq('author_id', authorId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ManuscriptRow[];
}

export async function createManuscript(input: ManuscriptInsert) {
  const { data, error } = await supabaseClient.from('manuscripts').insert(input as never).select().single();
  if (error) throw error;
  return data as ManuscriptRow | null;
}

export async function updateManuscript(id: string, updates: ManuscriptUpdate) {
  const { data, error } = await supabaseClient.from('manuscripts').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as ManuscriptRow | null;
}
