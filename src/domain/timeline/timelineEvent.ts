import type { TimelineEvent } from '@/types/domain.types';

/** Canonical product-history events. Proposal/message events are added by their owning phases. */
export const TIMELINE_EVENT_SEQUENCE: readonly TimelineEvent[] = [
  'project_created',
  'project_stage_changed',
  'project_completed',
  'chapter_created',
  'chapter_delivered',
  'deliverable_created',
  'deliverable_approved',
  'review_created',
  'review_resolved',
  'review_discarded',
] as const;

export function isTimelineEvent(value: string | null | undefined): value is TimelineEvent {
  return value !== null
    && value !== undefined
    && TIMELINE_EVENT_SEQUENCE.includes(value as TimelineEvent);
}
