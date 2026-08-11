import type {
  EvaluationResult,
  Project,
  Proposal,
  ProjectRequest,
} from '@/types/domain.types';
import type { EditorialJourneyContext } from '@/domain/editorial/deriveEditorialJourney';

export interface EditorialJourneyContextInput {
  hasManuscript: boolean;
  request: ProjectRequest | null;
  evaluationResult: EvaluationResult | null;
  proposal: Proposal | null;
  project: Project | null;
  hasOpenReviews: boolean;
}

/**
 * Builds the domain-only context consumed by deriveEditorialJourney().
 * No database access, navigation, labels or presentation concerns belong here.
 */
export function buildEditorialJourneyContext(
  input: EditorialJourneyContextInput,
): EditorialJourneyContext {
  return {
    hasManuscript: input.hasManuscript,
    requestStatus: input.request?.status ?? null,
    evaluationResult: input.evaluationResult,
    proposalStatus: input.proposal?.status ?? null,
    projectStatus: input.project?.status ?? null,
    hasOpenReviews: input.hasOpenReviews,
  };
}
