import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';
import type { ProjectStatus } from '@/types/domain.types';
import { getEditorialWorkspaceByManuscript } from '@/services/editorial-workspace.service';
import { getAuthorRequestContext, type AuthorRequestContext, type AuthorRequestState } from '@/services/manuscript.service';
import { getAuthorProjectsList, type AuthorProjectOverview } from '@/services/project.service';

export type DashboardRequestState = AuthorRequestState | 'proposal' | 'proposal_sent';

export interface DashboardWorkspaceData {
  manuscriptId: string | null;
  requestContext: AuthorRequestContext | null;
  projectsOverview: AuthorProjectOverview[];
  editorialWorkspace: AuthorProjectViewModel | null;
  requestState: DashboardRequestState;
  projectId: string | null;
  projectStatus: ProjectStatus | null;
  projectTitle: string | null;
  proposalSentAt: string | null;
}

function buildWorkspaceData(
  manuscriptId: string | null,
  requestContext: AuthorRequestContext | null,
  projectsOverview: AuthorProjectOverview[],
  editorialWorkspace: AuthorProjectViewModel | null,
  proposalSentAt: string | null = null,
): DashboardWorkspaceData {
  const selectedManuscript = requestContext?.manuscripts.find((manuscript) => manuscript.id === manuscriptId);
  const requestStatus = selectedManuscript?.requestStatus;

  let resolvedRequestState: DashboardRequestState =
    requestContext?.state ?? (editorialWorkspace?.project ? 'active' : 'none');

  if (requestStatus === 'accepted') {
    resolvedRequestState = proposalSentAt ? 'proposal_sent' : 'proposal';
  }

  return {
    manuscriptId,
    requestContext,
    projectsOverview,
    editorialWorkspace,
    requestState: resolvedRequestState,
    projectId: editorialWorkspace?.project?.id ?? requestContext?.projectId ?? null,
    projectStatus: editorialWorkspace?.project?.status ?? null,
    projectTitle: requestContext?.title ?? null,
    proposalSentAt,
  };
}

/**
 * Coordinates dashboard data for the currently selected manuscript.
 * The request phase remains available even when a Project does not yet exist.
 */
export async function getDashboardWorkspaceData(
  authorId: string | null,
  selectedManuscriptId?: string | null,
): Promise<DashboardWorkspaceData> {
  if (!authorId && selectedManuscriptId) {
    let editorialWorkspace: AuthorProjectViewModel | null = null;
    try {
      editorialWorkspace = await getEditorialWorkspaceByManuscript(selectedManuscriptId);
    } catch (error) {
      console.error('Error loading editorial workspace:', error);
    }
    return buildWorkspaceData(selectedManuscriptId, null, [], editorialWorkspace, editorialWorkspace?.proposal?.sentAt ?? null);
  }

  if (!authorId) {
    return buildWorkspaceData(null, null, [], null);
  }

  const [projectsOverview, requestContext] = await Promise.all([
    getAuthorProjectsList(authorId),
    getAuthorRequestContext(authorId, selectedManuscriptId ?? null),
  ]);

  const manuscriptId = selectedManuscriptId ?? requestContext.manuscriptId ?? null;
  let editorialWorkspace: AuthorProjectViewModel | null = null;

  if (manuscriptId) {
    try {
      editorialWorkspace = await getEditorialWorkspaceByManuscript(manuscriptId);
    } catch (error) {
      console.error('Error loading editorial workspace:', error);
    }
  }

  return buildWorkspaceData(
    manuscriptId,
    requestContext,
    projectsOverview,
    editorialWorkspace,
    editorialWorkspace?.proposal?.sentAt ?? null,
  );
}
