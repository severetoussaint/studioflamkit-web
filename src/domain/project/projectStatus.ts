import type { ProjectStatus } from '@/types/domain.types';

/**
 * Canonical business-state sequence for projects.
 *
 * This is domain semantics only; UI labels, colors and progress percentages
 * belong to role-specific ViewModels/presentation layers.
 */
export const PROJECT_STATUS_SEQUENCE: readonly ProjectStatus[] = [
  'planning',
  'production',
  'review',
  'completed',
  'archived',
] as const;

export function isProjectStatus(value: string | null | undefined): value is ProjectStatus {
  return value !== null && value !== undefined && PROJECT_STATUS_SEQUENCE.includes(value as ProjectStatus);
}
