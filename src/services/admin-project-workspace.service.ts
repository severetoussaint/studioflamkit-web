import { getProject, getProjectByManuscript } from '@/services/project.service';
import { getProjectProgress } from '@/services/production-stage.service';
import { hasOpenReviewsByProject } from '@/services/review.service';
import { mapProjectRowToDomain } from '@/domain/project/mapProject';
import type { AdminProjectViewModel } from '@/domain/view-models/adminProjectViewModel';

export async function getAdminProjectWorkspace(projectId: string): Promise<AdminProjectViewModel | null> {
  const projectRow = await getProject(projectId);
  if (!projectRow) return null;

  const [progress, hasOpenReviews] = await Promise.all([
    getProjectProgress(projectRow.id),
    hasOpenReviewsByProject(projectRow.id),
  ]);

  return {
    project: mapProjectRowToDomain(projectRow),
    progress,
    hasOpenReviews,
  };
}

export async function getAdminProjectWorkspaceByManuscript(manuscriptId: string): Promise<AdminProjectViewModel | null> {
  const projectRow = await getProjectByManuscript(manuscriptId);
  if (!projectRow) return null;

  const [progress, hasOpenReviews] = await Promise.all([
    getProjectProgress(projectRow.id),
    hasOpenReviewsByProject(projectRow.id),
  ]);

  return {
    project: mapProjectRowToDomain(projectRow),
    progress,
    hasOpenReviews,
  };
}
