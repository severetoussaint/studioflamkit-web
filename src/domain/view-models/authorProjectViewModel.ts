import type {
  Chapter,
  Deliverable,
  EditorialJourney,
  Project,
  ProjectProgress,
  ProjectRequest,
  Proposal,
  Review,
  TimelineEntry,
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
  reviews: Review[];
  timeline: TimelineEntry[];
  hasOpenReviews: boolean;
  chapters: Chapter[];
  deliverables: Deliverable[];
  revisionsIncluded: number | null;
}
