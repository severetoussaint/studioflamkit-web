import type { Project, ProjectProgress, Proposal } from '@/types/domain.types';
import { buildEditorialJourneyContext } from '@/domain/editorial/buildEditorialJourneyContext';
import { deriveEditorialJourney } from '@/domain/editorial/deriveEditorialJourney';
import { getCurrentProposalForRequest } from '@/services/proposal.service';
import { getEvaluationByRequest } from '@/services/evaluation.service';
import { getProjectRequestByManuscript } from '@/services/request.service';
import { getProjectByManuscript } from '@/services/project.service';
import { mapProjectRowToDomain } from '@/domain/project/mapProject';
import { hasOpenReviewsByProject } from '@/services/review.service';
import { getProjectProgress } from '@/services/production-stage.service';
import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';

export type EditorialWorkspaceData = AuthorProjectViewModel;

/**
 * Loads the shared author workspace domain data for one manuscript.
 * Presentation-specific labels, colors and layout state remain outside this service.
 * Evaluation data is consumed only to derive the editorial journey and is not
 * exposed through the author-facing workspace contract.
 */
export async function getEditorialWorkspaceByManuscript(
  manuscriptId: string,
): Promise<EditorialWorkspaceData> {
  const request = await getProjectRequestByManuscript(manuscriptId);
  const projectRowPromise = getProjectByManuscript(manuscriptId);

  const [evaluation, proposal, projectRow] = await Promise.all([
    request ? getEvaluationByRequest(request.id) : Promise.resolve(null),
    request ? getCurrentProposalForRequest(request.id) : Promise.resolve(null),
    projectRowPromise,
  ]);

  const project: Project | null = projectRow ? mapProjectRowToDomain(projectRow) : null;

  let progress: ProjectProgress | null = null;
  let hasOpenReviews = false;

  if (project) {
    [progress, hasOpenReviews] = await Promise.all([
      getProjectProgress(project.id),
      hasOpenReviewsByProject(project.id),
    ]);
  }

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
    proposal,
    project,
    progress,
    hasOpenReviews,
    journey: deriveEditorialJourney(context),
  };
}
