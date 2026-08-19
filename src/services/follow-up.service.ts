import { supabaseClient } from '@/lib/supabase/client';
import type { EvaluationResult, ProjectRequest } from '@/types/domain.types';
import { markEvaluationEmailSent, updateEvaluationFollowUpNote } from '@/services/evaluation.service';

export type FollowUpCategory = 'email_pending' | 'proposal_ready' | 'history';

export interface AdminFollowUpItem {
  request: ProjectRequest;
  evaluationId: string | null;
  title: string;
  client: string;
  email: string | null;
  result: EvaluationResult | null;
  authorMessage: string | null;
  emailSentAt: string | null;
  followUpNote: string | null;
  createdAt: string;
  category: FollowUpCategory;
}

interface FollowUpRow {
  id: string;
  status: string;
  created_at: string;
  manuscripts?: {
    id?: string;
    title?: string;
    author_id?: string;
    authors?: {
      full_name?: string | null;
      email?: string | null;
    } | null;
  } | null;
  evaluations?: Array<{
    id: string;
    result?: string | null;
    author_message?: string | null;
    email_sent_at?: string | null;
    follow_up_note?: string | null;
    created_at?: string | null;
  }> | null;
}

function mapRequest(row: FollowUpRow): ProjectRequest {
  return {
    id: row.id,
    manuscriptId: row.manuscripts?.id ?? '',
    channel: null,
    status: row.status as ProjectRequest['status'],
    createdAt: row.created_at,
  };
}

function getEvaluation(row: FollowUpRow) {
  return Array.isArray(row.evaluations) ? row.evaluations[0] ?? null : row.evaluations ?? null;
}

export async function listAdminFollowUps(): Promise<AdminFollowUpItem[]> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select(`
      id,
      status,
      created_at,
      manuscripts (
        id,
        title,
        author_id,
        authors ( full_name, email )
      ),
      evaluations (
        id,
        result,
        author_message,
        email_sent_at,
        follow_up_note,
        created_at
      )
    `)
    .in('status', ['rejected', 'accepted'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data as unknown as FollowUpRow[]) ?? [])
    .map((row) => {
      const evaluation = getEvaluation(row);
      const result = (evaluation?.result ?? null) as EvaluationResult | null;

      if (row.status === 'accepted' && !['approved', 'approved_with_notes'].includes(result ?? '')) {
        return null;
      }

      const category: FollowUpCategory =
        row.status === 'rejected' && !evaluation?.email_sent_at
          ? 'email_pending'
          : row.status === 'accepted'
            ? 'proposal_ready'
            : 'history';

      return {
        request: mapRequest(row),
        evaluationId: evaluation?.id ?? null,
        title: row.manuscripts?.title ?? 'Sin título',
        client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
        email: row.manuscripts?.authors?.email ?? null,
        result,
        authorMessage: evaluation?.author_message ?? null,
        emailSentAt: evaluation?.email_sent_at ?? null,
        followUpNote: evaluation?.follow_up_note ?? null,
        createdAt: row.created_at,
        category,
      } satisfies AdminFollowUpItem;
    })
    .filter((item): item is AdminFollowUpItem => item !== null);
}

export async function markFollowUpEmailSent(evaluationId: string): Promise<void> {
  await markEvaluationEmailSent(evaluationId);
}

export async function saveFollowUpNote(evaluationId: string, note: string | null): Promise<void> {
  await updateEvaluationFollowUpNote(evaluationId, note);
}
