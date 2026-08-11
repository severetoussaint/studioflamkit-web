import type { EvaluationResult, Project, Proposal } from '@/types/domain.types';
import { buildEditorialJourneyContext } from '@/domain/editorial/buildEditorialJourneyContext';
import { deriveEditorialJourney } from '@/domain/editorial/deriveEditorialJourney';
import { listProposals } from '@/services/proposal.service';
import { getEvaluationByRequest } from '@/services/evaluation.service';
import { getProjectRequestByManuscript } from '@/services/request.service';
import { getProjectByManuscript } from '@/services/project.service';
import { mapProjectRowToDomain } from '@/domain/project/mapProject';
import { hasOpenReviewsByProject } from '@/services/review.service';
import { getProjectProgress } from '@/services/production-stage.service';
import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';

export type EditorialWorkspaceData = AuthorProjectViewModel & {
  evaluationResult: EvaluationResult | null;
};

/**
 * Loads the shared author workspace domain data for one manuscript.
 * Presentation-specific labels, colors and layout state remain outside this service.
 */
export async function getEditorialWorkspaceByManuscript(
  manuscriptId: string,
): Promise<EditorialWorkspaceData> {
  const request = await getProjectRequestByManuscript(manuscriptId);
  const projectRowPromise = getProjectByManuscript(manuscriptId);

  const [evaluation, proposals, projectRow] = await Promise.all([
    request ? getEvaluationByRequest(request.id) : Promise.resolve(null),
    request ? listProposals(request.id) : Promise.resolve([]),
    projectRowPromise,
  ]);

  const proposal: Proposal | null = proposals[0] ?? null;
  const project: Project | null = projectRow ? mapProjectRowToDomain(projectRow) : null;

  const [progress, hasOpenReviews] = project
    ? await Promise.all([
        getProjectProgress(project.id),
        hasOpenReviewsByProject(project.id),
      ])
    : [null, false];

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
    progress,
    hasOpenReviews,
    journey: deriveEditorialJourney(context),
  };
}
