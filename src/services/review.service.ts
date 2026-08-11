import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Review } from '@/types/domain.types';
import { mapReviewRowToDomain } from '@/domain/review/mapReview';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type DeliverableRow = Pick<Database['public']['Tables']['deliverables']['Row'], 'id'>;

export async function getReview(reviewId: string): Promise<Review | null> {
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapReviewRowToDomain(data as ReviewRow) : null;
}

export async function listReviewsByDeliverable(deliverableId: string): Promise<Review[]> {
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('deliverable_id', deliverableId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map(mapReviewRowToDomain);
}

export async function listReviewsByProject(projectId: string): Promise<Review[]> {
  const { data: deliverables, error: deliverablesError } = await supabaseClient
    .from('deliverables')
    .select('id')
    .eq('project_id', projectId);

  if (deliverablesError) throw deliverablesError;

  const deliverableIds = ((deliverables ?? []) as DeliverableRow[]).map((deliverable) => deliverable.id);
  if (deliverableIds.length === 0) return [];

  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .in('deliverable_id', deliverableIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map(mapReviewRowToDomain);
}

export async function hasOpenReviewsByProject(projectId: string): Promise<boolean> {
  const { data: deliverables, error: deliverablesError } = await supabaseClient
    .from('deliverables')
    .select('id')
    .eq('project_id', projectId);

  if (deliverablesError) throw deliverablesError;

  const deliverableIds = ((deliverables ?? []) as DeliverableRow[]).map((deliverable) => deliverable.id);
  if (deliverableIds.length === 0) return false;

  const { data, error } = await supabaseClient
    .from('reviews')
    .select('id')
    .in('deliverable_id', deliverableIds)
    .eq('status', 'open')
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}
