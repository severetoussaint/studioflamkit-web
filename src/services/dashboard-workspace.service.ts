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
 * available to preserve existing UI behavior while the dashboard migrates toward
 * the shared EditorialWorkspace ViewModel.
 */
export async function getDashboardWorkspaceData(
  authorId: string,
  selectedManuscriptId?: string | null,
): Promise<DashboardWorkspaceData> {
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
