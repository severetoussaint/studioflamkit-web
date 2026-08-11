'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DashboardWorkspaceData } from '@/services/dashboard-workspace.service';
import { getDashboardWorkspaceData } from '@/services/dashboard-workspace.service';

export interface DashboardWorkspaceState {
  data: DashboardWorkspaceData | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useDashboardWorkspace(
  authorId: string | null,
  selectedManuscriptId: string | null,
): DashboardWorkspaceState {
  const [data, setData] = useState<DashboardWorkspaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!authorId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workspace = await getDashboardWorkspaceData(authorId, selectedManuscriptId);
      setData(workspace);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [authorId, selectedManuscriptId]);

  useEffect(() => {
    // Synchronizes the selected external workspace into local hook state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}
