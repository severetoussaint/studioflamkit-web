import type { Database } from '@/types/database.types';
import type { Review } from '@/types/domain.types';
import { isReviewStatus } from '@/domain/review/reviewStatus';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];

function mapReviewStatus(value: string | null) {
  return isReviewStatus(value) ? value : 'open';
}

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
