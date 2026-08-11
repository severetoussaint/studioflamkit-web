import type { ReviewStatus } from '@/types/domain.types';

/** Canonical editorial review-state sequence owned by the domain layer. */
export const REVIEW_STATUS_SEQUENCE: readonly ReviewStatus[] = [
  'open',
  'resolved',
  'discarded',
] as const;

export function isReviewStatus(value: string | null | undefined): value is ReviewStatus {
  return value !== null
    && value !== undefined
    && REVIEW_STATUS_SEQUENCE.includes(value as ReviewStatus);
}
