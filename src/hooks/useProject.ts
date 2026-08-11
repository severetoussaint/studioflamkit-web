import { useCallback, useEffect, useState } from 'react';
import type { Project, ProjectStatus } from '@/types/domain.types';
import { mapProjectRowToDomain } from '@/domain/project/mapProject';
import {
  getProject,
  updateProjectStatus,
} from '@/services/project.service';

export interface UseProjectState {
  data: Project | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  updateStatus: (status: ProjectStatus) => Promise<Project>;
}

export function useProject(projectId: string | null): UseProjectState {
  const [data, setData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const row = await getProject(projectId);
      setData(row ? mapProjectRowToDomain(row) : null);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Async project synchronization intentionally updates local state after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const updateStatus = useCallback(async (status: ProjectStatus) => {
    if (!projectId) throw new Error('projectId is required to update project status.');
    const row = await updateProjectStatus(projectId, status);
    const project = mapProjectRowToDomain(row as NonNullable<typeof row>);
    setData(project);
    return project;
  }, [projectId]);

  return { data, loading, error, reload, updateStatus };
}
