import type {
  EditorialJourney,
  Project,
  ProjectProgress,
  ProjectRequest,
  Proposal,
} from '@/types/domain.types';

/**
 * Stable author-facing workspace contract.
 *
 * This is intentionally limited to product/domain data. Presentation-specific
 * labels, colors, button copy and layout state remain outside this ViewModel.
 */
export interface AuthorProjectViewModel {
  project: Project | null;
  request: ProjectRequest | null;
  proposal: Proposal | null;
  journey: EditorialJourney | null;
  progress: ProjectProgress | null;
  hasOpenReviews: boolean;
}
