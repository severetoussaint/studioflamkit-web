import type { EvaluationResult, Project, ProjectRequest, Proposal } from '@/types/domain.types';
import { buildEditorialJourneyContext } from '@/domain/editorial/buildEditorialJourneyContext';
import { deriveEditorialJourney } from '@/domain/editorial/deriveEditorialJourney';
import { getEvaluationByRequest } from '@/services/evaluation.service';
import { getProjectRequestByManuscript } from '@/services/request.service';
import { getProposal } from '@/services/proposal.service';
import { getProjectByManuscript } from '@/services/project.service';
import { hasOpenReviewsByProject } from '@/services/review.service';

export interface EditorialWorkspaceData {
  request: ProjectRequest | null;
  evaluationResult: EvaluationResult | null;
  proposal: Proposal | null;
  project: Project | null;
  hasOpenReviews: boolean;
  journey: ReturnType<typeof deriveEditorialJourney>;
}

/**
 * Loads the shared editorial domain context for one manuscript.
 * This service intentionally exposes domain data only; UI ViewModels belong
 * to Dashboard/Admin adapters and are not built here.
 */
export async function getEditorialWorkspaceByManuscript(
  manuscriptId: string,
): Promise<EditorialWorkspaceData> {
  const request = await getProjectRequestByManuscript(manuscriptId);
  const evaluation = request ? await getEvaluationByRequest(request.id) : null;
  const proposal = request ? await getLatestProposalByRequest(request.id) : null;
  const project = await getProjectByManuscript(manuscriptId);
  const hasOpenReviews = project ? await hasOpenReviewsByProject(project.id) : false;

  const context = buildEditorialJourneyContext({
    hasManuscript: true,
    request,
    evaluationResult: evaluation?.result ?? null,
    proposal,
    project,
    hasOpenReviews,
  });

  return {
    request,
    evaluationResult: evaluation?.result ?? null,
    proposal,
    project,
    hasOpenReviews,
    journey: deriveEditorialJourney(context),
  };
}

async function getLatestProposalByRequest(requestId: string): Promise<Proposal | null> {
  const proposals = await import('@/services/proposal.service').then(({ listProposals }) => listProposals(requestId));
  return proposals[0] ?? null;
}
