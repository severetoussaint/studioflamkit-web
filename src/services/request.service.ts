import { supabaseClient } from '@/lib/supabase/client';
import type { ProjectRequest, RequestStatus } from '@/types/domain.types';
import { mapProjectRequestRowToDomain } from '@/domain/request/mapProjectRequest';

type ReviewableRequestStatus = Extract<RequestStatus, 'pending' | 'evaluating' | 'rejected' | 'canceled'>;

export interface ProjectRequestAuthorContact {
  id: string;
  email: string | null;
  fullName: string | null;
}

export async function listProjectRequests(): Promise<ProjectRequest[]> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapProjectRequestRowToDomain);
}

export async function getProjectRequest(requestId: string): Promise<ProjectRequest | null> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProjectRequestRowToDomain(data) : null;
}

export async function getProjectRequestByManuscript(manuscriptId: string): Promise<ProjectRequest | null> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProjectRequestRowToDomain(data) : null;
}

/**
 * Resolves the author behind a request. Request identity remains anchored to manuscript_id.
 */
export async function getProjectRequestAuthorContact(requestId: string): Promise<ProjectRequestAuthorContact | null> {
  if (!requestId) return null;

  const { data, error } = await supabaseClient
    .from('project_requests')
    .select('manuscripts(author_id, authors(email, full_name))')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;

  const manuscripts = data?.manuscripts;
  const manuscript = Array.isArray(manuscripts) ? manuscripts[0] : manuscripts;
  const authorId = manuscript?.author_id ?? null;
  if (!authorId) return null;

  const authors = manuscript?.authors;
  const author = Array.isArray(authors) ? authors[0] : authors;

  return {
    id: authorId,
    email: author?.email ?? null,
    fullName: author?.full_name ?? null,
  };
}

export async function getProjectRequestAuthorId(requestId: string): Promise<string | null> {
  const contact = await getProjectRequestAuthorContact(requestId);
  return contact?.id ?? null;
}

/**
 * Moves a valid incoming request into the internal editorial analysis phase.
 * This is not proposal acceptance and must never create a project.
 */
export async function startProjectRequestAnalysis(requestId: string): Promise<ProjectRequest> {
  const current = await getProjectRequest(requestId);
  if (!current) throw new Error(`Project request ${requestId} not found.`);

  if (current.status !== 'pending' && current.status !== 'evaluating') {
    throw new Error(`Project request ${requestId} cannot enter analysis from status ${current.status}.`);
  }

  if (current.status === 'evaluating') return current;

  const { data, error } = await supabaseClient
    .from('project_requests')
    .update({ status: 'evaluating' })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) throw error;
  return mapProjectRequestRowToDomain(data);
}

/**
 * Updates only the request states that belong to request/review workflow.
 * Acceptance/rejection of a formal proposal must go through proposal.service.ts
 * and its transactional Supabase RPCs so Proposal remains the commercial authority.
 */
export async function updateProjectRequestReviewStatus(
  requestId: string,
  status: ReviewableRequestStatus,
): Promise<ProjectRequest> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .update({ status })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) throw error;
  return mapProjectRequestRowToDomain(data);
}

export async function deleteProjectRequest(requestId: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from('project_requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
  return true;
}
