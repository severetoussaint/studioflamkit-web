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

export async function uploadFileToStorage(bucket: string, path: string, file: File) {
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.warn(`Advertencia al subir a Storage (${bucket}):`, error);
  }
  return data;
}

export async function uploadProjectDeliverableFile(
  projectId: string,
  title: string,
  file: File,
  ownerId?: string
) {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${projectId}/${Date.now()}_${cleanName}`;

  await uploadFileToStorage('deliverables', path, file);

  const { data: deliverable, error: delError } = await supabaseClient
    .from('deliverables')
    .insert({
      project_id: projectId,
      title: title || file.name,
      storage_path: path,
      status: 'pending',
    } as never)
    .select()
    .single();

  if (delError) {
    console.error('Error al insertar deliverable en DB:', delError);
  }

  await createFileRecord({
    bucket: 'deliverables',
    path,
    project_id: projectId,
    owner_id: ownerId,
    mime_type: file.type || 'audio/mpeg',
    size_bytes: file.size,
  });

  return deliverable;
}
