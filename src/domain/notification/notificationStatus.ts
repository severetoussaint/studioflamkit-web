import type { NotificationStatus } from '@/types/domain.types';

/** Canonical notification lifecycle owned by the domain layer. */
export const NOTIFICATION_STATUS_SEQUENCE: readonly NotificationStatus[] = [
  'pending',
  'sent',
  'read',
] as const;

export function isNotificationStatus(value: string | null | undefined): value is NotificationStatus {
  return value !== null
    && value !== undefined
    && NOTIFICATION_STATUS_SEQUENCE.includes(value as NotificationStatus);
}
