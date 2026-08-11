import type { Database } from '@/types/database.types';
import type { Review } from '@/types/domain.types';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];

/** Maps the persisted review row into the shared domain model. */
export function mapReviewRowToDomain(row: ReviewRow): Review {
  return {
    id: row.id,
    deliverableId: row.deliverable_id,
    chapterTitle: row.chapter_title,
    comment: row.comment,
    filePath: row.file_path,
    status: row.status,
    createdAt: row.created_at ?? '',
  };
}
