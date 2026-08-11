import type {
  EditorialJourney,
  Project,
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
  hasOpenReviews: boolean;
}

export function buildAuthorProjectViewModel(input: AuthorProjectViewModel): AuthorProjectViewModel {
  return input;
}
