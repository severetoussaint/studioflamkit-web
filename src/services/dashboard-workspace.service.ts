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
  requestStatusOverride: string | null = null,
  requestIdOverride: string | null = null,
  proposalSentAt: string | null = null,
): DashboardWorkspaceData {
  const selectedManuscript = requestContext?.manuscripts.find((manuscript) => manuscript.id === manuscriptId);
  const requestStatus = requestStatusOverride ?? selectedManuscript?.requestStatus;
  const normalizedRequestContext = requestContext && requestIdOverride
    ? { ...requestContext, requestId: requestIdOverride }
    : requestContext;

  let resolvedRequestState: DashboardRequestState =
    normalizedRequestContext?.state ?? (editorialWorkspace?.project ? 'active' : 'none');

  if (requestStatus === 'accepted') {
    resolvedRequestState = proposalSentAt ? 'proposal_sent' : 'proposal';
  }

  return {
    manuscriptId,
    requestContext: normalizedRequestContext,
    projectsOverview,
    editorialWorkspace,
    requestState: resolvedRequestState,
    projectId: editorialWorkspace?.project?.id ?? normalizedRequestContext?.projectId ?? null,
    projectStatus: editorialWorkspace?.project?.status ?? null,
    projectTitle: normalizedRequestContext?.title ?? null,
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
  let editorialWorkspace: AuthorProjectViewModel | null = null;
  let requestStatusOverride: string | null = null;
  let requestIdOverride: string | null = null;
  let proposalSentAt: string | null = null;

  if (manuscriptId) {
    try {
      editorialWorkspace = await getEditorialWorkspaceByManuscript(manuscriptId);
      proposalSentAt = editorialWorkspace?.proposal?.sentAt ?? null;
    } catch (error) {
      console.error('Error loading editorial workspace:', error);
    }

    const { data: requestRow, error: requestError } = await supabaseClient
      .from('project_requests')
      .select('id, status')
      .eq('manuscript_id', manuscriptId)
      .maybeSingle();

    if (!requestError && requestRow) {
      requestStatusOverride = requestRow.status;
      requestIdOverride = requestRow.id;
    }
  }

  return buildWorkspaceData(manuscriptId, requestContext, projectsOverview, editorialWorkspace, requestStatusOverride, requestIdOverride, proposalSentAt);
}
