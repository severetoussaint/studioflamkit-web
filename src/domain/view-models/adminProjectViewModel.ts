import type {
  Project,
  ProjectProgress,
} from '@/types/domain.types';

/**
 * Stable admin-facing workspace contract.
 *
 * Operational UI can add presentation-specific fields later, but this contract
 * keeps project semantics, status and real production progress in the shared
 * domain layer.
 */
export interface AdminProjectViewModel {
  project: Project | null;
  progress: ProjectProgress | null;
  hasOpenReviews: boolean;
}
