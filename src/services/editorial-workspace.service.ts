import type { Chapter, Deliverable, Project, ProjectProgress } from '@/types/domain.types';
import { buildEditorialJourneyContext } from '@/domain/editorial/buildEditorialJourneyContext';
import { deriveEditorialJourney } from '@/domain/editorial/deriveEditorialJourney';
import { getCurrentProposalForRequest, getProposal } from '@/services/proposal.service';
import { getEvaluationByRequest } from '@/services/evaluation.service';
import { getProjectRequestByManuscript } from '@/services/request.service';
import { getProjectByManuscript, listProjectChapters, listProjectDeliverables } from '@/services/project.service';
import { mapProjectRowToDomain } from '@/domain/project/mapProject';
import { hasOpenReviewsByProject, listReviewsByProject } from '@/services/review.service';
import { getProjectProgress } from '@/services/production-stage.service';
import { listProjectTimeline } from '@/services/timeline.service';
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
  let reviews = [] as Awaited<ReturnType<typeof listReviewsByProject>>;
  let timeline = [] as Awaited<ReturnType<typeof listProjectTimeline>>;
  let hasOpenReviews = false;
  let chapters: Chapter[] = [];
  let deliverables: Deliverable[] = [];

  if (project) {
    [progress, reviews, timeline, hasOpenReviews, chapters, deliverables] = await Promise.all([
      getProjectProgress(project.id),
      listReviewsByProject(project.id),
      listProjectTimeline(project.id),
      hasOpenReviewsByProject(project.id),
      listProjectChapters(project.id),
      listProjectDeliverables(project.id),
    ]);
  }

  let revisionsIncluded: number | null = null;
  if (project) {
    if (proposal && proposal.revisionsIncluded !== null && proposal.revisionsIncluded !== undefined) {
      revisionsIncluded = proposal.revisionsIncluded;
    } else if (project.proposalId) {
      const acceptedProposal = await getProposal(project.proposalId);
      revisionsIncluded = acceptedProposal?.revisionsIncluded ?? null;
    }
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
    reviews,
    timeline,
    hasOpenReviews,
    chapters,
    deliverables,
    revisionsIncluded,
    journey: deriveEditorialJourney(context),
  };
}
