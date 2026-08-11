import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Review, ReviewStatus } from '@/types/domain.types';
import { mapReviewRowToDomain } from '@/domain/review/mapReview';
import { isReviewStatus } from '@/domain/review/reviewStatus';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type DeliverableRow = Pick<Database['public']['Tables']['deliverables']['Row'], 'id'>;
type ReviewTransitionStatus = Exclude<ReviewStatus, 'open'>;
type ReviewRpcResult = {
  data: string | null;
  error: { message: string } | null;
};

type RpcClient = (
  functionName: string,
  args: Record<string, unknown>,
) => Promise<ReviewRpcResult>;

const rpcClient = supabaseClient.rpc as unknown as RpcClient;

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

  const { data: reviewId, error } = await rpcClient('create_review', {
    p_deliverable_id: input.deliverableId,
    p_chapter_title: input.chapterTitle ?? null,
    p_comment: input.comment,
    p_file_path: input.filePath ?? null,
  });

  if (error) throw new Error(error.message);
  if (!reviewId) throw new Error('Review creation did not return an id.');

  const review = await getReview(reviewId);
  if (!review) throw new Error(`Review ${reviewId} not found after creation.`);
  return review;
}

async function updateReviewStatus(reviewId: string, status: ReviewTransitionStatus): Promise<Review> {
  if (!isReviewStatus(status)) {
    throw new Error(`Invalid review transition status: ${status}`);
  }

  const rpcName = status === 'resolved' ? 'resolve_review' : 'discard_review';
  const { data: persistedReviewId, error } = await rpcClient(rpcName, {
    p_review_id: reviewId,
  });

  if (error) throw new Error(error.message);
  if (!persistedReviewId) throw new Error(`Review ${reviewId} did not return an id after transition.`);

  const review = await getReview(persistedReviewId);
  if (!review) throw new Error(`Review ${persistedReviewId} not found after transition.`);
  return review;
}

export async function resolveReview(reviewId: string): Promise<Review> {
  return updateReviewStatus(reviewId, 'resolved');
}

export async function discardReview(reviewId: string): Promise<Review> {
  return updateReviewStatus(reviewId, 'discarded');
}
