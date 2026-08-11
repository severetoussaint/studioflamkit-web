import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Review, ReviewStatus } from '@/types/domain.types';
import { mapReviewRowToDomain } from '@/domain/review/mapReview';
import { isReviewStatus } from '@/domain/review/reviewStatus';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type DeliverableRow = Pick<Database['public']['Tables']['deliverables']['Row'], 'id'>;
type ReviewTransitionStatus = Exclude<ReviewStatus, 'open'>;

export interface CreateReviewInput {
  deliverableId: string;
  chapterTitle?: string | null;
  comment: string;
  filePath?: string | null;
}

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

export async function createReview(input: CreateReviewInput): Promise<Review> {
  if (!input.deliverableId) throw new Error('deliverableId is required to create a review.');
  if (!input.comment.trim()) throw new Error('Review comment is required.');

  const { data, error } = await supabaseClient
    .from('reviews')
    .insert({
      deliverable_id: input.deliverableId,
      chapter_title: input.chapterTitle ?? null,
      comment: input.comment,
      file_path: input.filePath ?? null,
      status: 'open',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapReviewRowToDomain(data as ReviewRow);
}

async function updateReviewStatus(reviewId: string, status: ReviewTransitionStatus): Promise<Review> {
  if (!isReviewStatus(status) || status === 'open') {
    throw new Error(`Invalid review transition status: ${status}`);
  }

  const review = await getReview(reviewId);
  if (!review) throw new Error(`Review ${reviewId} not found.`);

  if (review.status !== 'open') {
    throw new Error(`Review ${reviewId} is already ${review.status}.`);
  }

  const { data, error } = await supabaseClient
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .eq('status', 'open')
    .select('*')
    .single();

  if (error) throw error;
  return mapReviewRowToDomain(data as ReviewRow);
}

export async function resolveReview(reviewId: string): Promise<Review> {
  return updateReviewStatus(reviewId, 'resolved');
}

export async function discardReview(reviewId: string): Promise<Review> {
  return updateReviewStatus(reviewId, 'discarded');
}
