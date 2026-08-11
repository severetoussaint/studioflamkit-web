import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';
import type { ProjectStatus } from '@/types/domain.types';
import { getEditorialWorkspaceByManuscript } from '@/services/editorial-workspace.service';
import { getAuthorRequestContext, type AuthorRequestContext, type AuthorRequestState } from '@/services/manuscript.service';
import { getAuthorProjectsList, type AuthorProjectOverview } from '@/services/project.service';

export interface DashboardWorkspaceData {
  manuscriptId: string | null;
  requestContext: AuthorRequestContext | null;
  projectsOverview: AuthorProjectOverview[];
  editorialWorkspace: AuthorProjectViewModel | null;
  requestState: AuthorRequestState;
  projectId: string | null;
  projectStatus: ProjectStatus | null;
  projectTitle: string | null;
}

function buildWorkspaceData(
  manuscriptId: string | null,
  requestContext: AuthorRequestContext | null,
  projectsOverview: AuthorProjectOverview[],
  editorialWorkspace: AuthorProjectViewModel | null,
): DashboardWorkspaceData {
  return {
    manuscriptId,
    requestContext,
    projectsOverview,
    editorialWorkspace,
    requestState: requestContext?.state ?? (editorialWorkspace?.project ? 'active' : 'none'),
    projectId: editorialWorkspace?.project?.id ?? requestContext?.projectId ?? null,
    projectStatus: editorialWorkspace?.project?.status ?? null,
    projectTitle: editorialWorkspace?.project?.title ?? requestContext?.title ?? null,
  };
}

/**
 * Coordinates dashboard data for the currently selected manuscript.
 * This is intentionally a transitional loader: legacy request/project reads remain
 * available when an author id is provided, while the shared EditorialWorkspace
 * becomes the source of domain project data.
 */
export async function getDashboardWorkspaceData(
  authorId: string | null,
  selectedManuscriptId?: string | null,
): Promise<DashboardWorkspaceData> {
  if (!authorId && selectedManuscriptId) {
    const editorialWorkspace = await getEditorialWorkspaceByManuscript(selectedManuscriptId);
    return buildWorkspaceData(selectedManuscriptId, null, [], editorialWorkspace);
  }

  if (!authorId) {
    return buildWorkspaceData(null, null, [], null);
  }

  const [projectsOverview, requestContext] = await Promise.all([
    getAuthorProjectsList(authorId),
    getAuthorRequestContext(authorId, selectedManuscriptId ?? null),
  ]);

  const manuscriptId = selectedManuscriptId ?? requestContext.manuscriptId ?? null;
  const editorialWorkspace = manuscriptId
    ? await getEditorialWorkspaceByManuscript(manuscriptId)
    : null;

  return buildWorkspaceData(manuscriptId, requestContext, projectsOverview, editorialWorkspace);
}
