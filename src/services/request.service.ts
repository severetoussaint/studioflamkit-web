import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { ProjectRequest, RequestStatus } from '@/types/domain.types';
import { mapProjectRequestRowToDomain } from '@/domain/request/mapProjectRequest';

type ProjectRequestRow = Database['public']['Tables']['project_requests']['Row'];

export async function listProjectRequests(): Promise<ProjectRequest[]> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ProjectRequestRow[]).map(mapProjectRequestRowToDomain);
}

export async function getProjectRequest(requestId: string): Promise<ProjectRequest | null> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProjectRequestRowToDomain(data as ProjectRequestRow) : null;
}

export async function getProjectRequestByManuscript(manuscriptId: string): Promise<ProjectRequest | null> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProjectRequestRowToDomain(data as ProjectRequestRow) : null;
}

export async function updateProjectRequestStatus(
  requestId: string,
  status: RequestStatus,
): Promise<ProjectRequest> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .update({ status })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) throw error;
  return mapProjectRequestRowToDomain(data as ProjectRequestRow);
}
