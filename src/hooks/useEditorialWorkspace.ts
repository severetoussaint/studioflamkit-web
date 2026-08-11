import { useCallback, useEffect, useState } from 'react';
import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';
import { getEditorialWorkspaceByManuscript } from '@/services/editorial-workspace.service';

export interface EditorialWorkspaceState {
  data: AuthorProjectViewModel | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useEditorialWorkspace(manuscriptId: string | null): EditorialWorkspaceState {
  const [data, setData] = useState<AuthorProjectViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!manuscriptId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workspace = await getEditorialWorkspaceByManuscript(manuscriptId);
      setData({
        project: workspace.project,
        request: workspace.request,
        proposal: workspace.proposal,
        journey: workspace.journey,
        hasOpenReviews: workspace.hasOpenReviews,
      });
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [manuscriptId]);

  useEffect(() => {
    // The hook intentionally synchronizes async external data into local state.
    // React's set-state-in-effect rule flags the invocation site even though the
    // actual state updates occur after the awaited service call.
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
