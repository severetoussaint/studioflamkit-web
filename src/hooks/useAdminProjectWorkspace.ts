import { useCallback, useEffect, useState } from 'react';
import {
  getAdminProjectWorkspace,
} from '@/services/admin-project-workspace.service';
import type { AdminProjectViewModel } from '@/domain/view-models/adminProjectViewModel';

interface UseAdminProjectWorkspaceResult {
  data: AdminProjectViewModel | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useAdminProjectWorkspace(projectId: string | null): UseAdminProjectWorkspaceResult {
  const [data, setData] = useState<AdminProjectViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const load = useCallback(async () => {
    if (!projectId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workspace = await getAdminProjectWorkspace(projectId);
      setData(workspace);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err : new Error('Unable to load admin project workspace.'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // The effect intentionally starts async synchronization of external service data.
  }, [load, reloadToken]);

  return { data, loading, error, reload };
}
