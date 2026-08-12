import { calculateManuscriptPrice } from '@/features/quotations/utils/calculator';
import { supabaseClient } from '@/lib/supabase/client';
import { mapProjectRequestRowToDomain } from '@/domain/request/mapProjectRequest';
import { adminService, handleSupabaseError, type QuotationRequest, type QuotationRequestStatus } from './admin.service';

interface ProjectRequestRow {
  id: string;
  status: string;
  created_at: string;
  manuscript_id?: string | null;
  manuscripts?: {
    id?: string;
    title?: string;
    word_count?: number;
    author_id?: string;
    authors?: {
      full_name?: string;
    } | null;
  } | null;
}

const REQUEST_SELECT = `
  id,
  status,
  created_at,
  manuscript_id,
  manuscripts (
    id,
    title,
    word_count,
    author_id,
    authors ( full_name )
  )
`;

async function resolveRequestRow(id: string): Promise<ProjectRequestRow | null> {
  const exactById = await supabaseClient
    .from('project_requests')
    .select(REQUEST_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (exactById.error) {
    handleSupabaseError(exactById.error, 'updateQuotationRequestStatus resolve exact id error');
  }

  if (exactById.data) {
    return exactById.data as ProjectRequestRow;
  }

  const byManuscriptId = await supabaseClient
    .from('project_requests')
    .select(REQUEST_SELECT)
    .eq('manuscript_id', id)
    .maybeSingle();

  if (byManuscriptId.error) {
    handleSupabaseError(byManuscriptId.error, 'updateQuotationRequestStatus resolve manuscript_id error');
  }

  if (byManuscriptId.data) {
    return byManuscriptId.data as ProjectRequestRow;
  }

  return null;
}

async function updateQuotationRequestStatusSafe(
  id: string,
  status: QuotationRequestStatus
): Promise<QuotationRequest | undefined> {
  const resolved = await resolveRequestRow(id);

  if (!resolved) {
    console.warn(`updateQuotationRequestStatus: No request found with id/manuscript_id ${id}`);
    return undefined;
  }

  const dbStatusMap: Record<QuotationRequestStatus, string> = {
    pendiente: 'pending',
    en_revision: 'evaluating',
    aprobada: 'accepted',
  };
  const dbStatus = dbStatusMap[status];

  const { error: updateError } = await supabaseClient
    .from('project_requests')
    .update({ status: dbStatus })
    .eq('id', resolved.id);

  if (updateError) {
    handleSupabaseError(updateError, 'updateQuotationRequestStatus update error');
  }

  const { data: refreshed, error: refreshError } = await supabaseClient
    .from('project_requests')
    .select(REQUEST_SELECT)
    .eq('id', resolved.id)
    .maybeSingle();

  if (refreshError) {
    handleSupabaseError(refreshError, 'updateQuotationRequestStatus refresh error');
  }

  const row = (refreshed ?? resolved) as ProjectRequestRow;
  const wordCount = row.manuscripts?.word_count ?? 0;
  const amount = wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0;
  const estimatedChapters = Math.max(1, Math.round(wordCount / 3000)) || 1;
  const durationMinutes = Math.round(wordCount / 155);

  const request = mapProjectRequestRowToDomain({
    id: row.id,
    manuscript_id: row.manuscripts?.id ?? row.manuscript_id ?? '',
    channel: null,
    status: row.status,
    created_at: row.created_at,
  });

  return {
    id: request.id,
    client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
    title: row.manuscripts?.title ?? 'Sin título',
    requestedAt: request.createdAt.slice(0, 10),
    status,
    request,
    chapters: estimatedChapters,
    amount,
    wordCount,
    durationMinutes,
    manuscript_id: request.manuscriptId,
    author_id: row.manuscripts?.author_id,
  };
}

(adminService as typeof adminService & {
  updateQuotationRequestStatus: typeof updateQuotationRequestStatusSafe;
}).updateQuotationRequestStatus = updateQuotationRequestStatusSafe;
