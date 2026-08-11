import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';
import { getEditorialWorkspaceByManuscript } from '@/services/editorial-workspace.service';
import { getAuthorRequestContext, type AuthorRequestContext } from '@/services/manuscript.service';
import { getAuthorProjectsList, type AuthorProjectOverview } from '@/services/project.service';

export interface DashboardWorkspaceData {
  manuscriptId: string | null;
  requestContext: AuthorRequestContext | null;
  projectsOverview: AuthorProjectOverview[];
  editorialWorkspace: AuthorProjectViewModel | null;
}

/**
 * Coordinates dashboard data for the currently selected manuscript.
 * This is intentionally a transitional loader: legacy request/project reads remain
 * available when an author id is provided, while callers that already have a
 * manuscript id can consume the shared EditorialWorkspace without a duplicate
 * author lookup.
 */
export async function getDashboardWorkspaceData(
  authorId: string | null,
  selectedManuscriptId?: string | null,
): Promise<DashboardWorkspaceData> {
  if (!authorId && selectedManuscriptId) {
    return {
      manuscriptId: selectedManuscriptId,
      requestContext: null,
      projectsOverview: [],
      editorialWorkspace: await getEditorialWorkspaceByManuscript(selectedManuscriptId),
    };
  }

  if (!authorId) {
    return {
      manuscriptId: null,
      requestContext: null,
      projectsOverview: [],
      editorialWorkspace: null,
    };
  }

  const [projectsOverview, requestContext] = await Promise.all([
    getAuthorProjectsList(authorId),
    getAuthorRequestContext(authorId, selectedManuscriptId ?? null),
  ]);

  const manuscriptId = selectedManuscriptId ?? requestContext.manuscriptId ?? null;
  const editorialWorkspace = manuscriptId
    ? await getEditorialWorkspaceByManuscript(manuscriptId)
    : null;

  return {
    manuscriptId,
    requestContext,
    projectsOverview,
    editorialWorkspace,
  };
}
