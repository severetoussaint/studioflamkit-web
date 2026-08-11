import type { RequestStatus } from '@/types/domain.types';

/** Canonical request-state sequence owned by the domain layer. */
export const REQUEST_STATUS_SEQUENCE: readonly RequestStatus[] = [
  'pending',
  'evaluating',
  'accepted',
  'rejected',
  'canceled',
] as const;

export function isRequestStatus(value: string | null | undefined): value is RequestStatus {
  return value !== null
    && value !== undefined
    && REQUEST_STATUS_SEQUENCE.includes(value as RequestStatus);
}
