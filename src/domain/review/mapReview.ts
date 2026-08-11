import type { Database } from '@/types/database.types';
import type { Review, ReviewStatus } from '@/types/domain.types';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];

const REVIEW_STATUSES: readonly ReviewStatus[] = ['open', 'resolved', 'discarded'];

function mapReviewStatus(value: string | null): ReviewStatus {
  return REVIEW_STATUSES.includes(value as ReviewStatus)
    ? (value as ReviewStatus)
    : 'open';
}

/** Maps the persisted review row into the shared domain model. */
export function mapReviewRowToDomain(row: ReviewRow): Review {
  return {
    id: row.id,
    deliverableId: row.deliverable_id,
    chapterTitle: row.chapter_title,
    comment: row.comment,
    filePath: row.file_path,
    status: mapReviewStatus(row.status),
    createdAt: row.created_at ?? '',
  };
}
