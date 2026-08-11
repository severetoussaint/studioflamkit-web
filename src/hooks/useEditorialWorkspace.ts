import { useCallback, useEffect, useState } from 'react';
import type { AuthorProjectViewModel } from '@/domain/view-models/authorProjectViewModel';
import { getEditorialWorkspaceByManuscript } from '@/services/editorial-workspace.service';
import type { EditorialWorkspaceData } from '@/services/editorial-workspace.service';

export interface EditorialWorkspaceState {
  data: AuthorProjectViewModel | null;
  evaluationResult: EditorialWorkspaceData['evaluationResult'];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useEditorialWorkspace(manuscriptId: string | null): EditorialWorkspaceState {
  const [data, setData] = useState<AuthorProjectViewModel | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EditorialWorkspaceData['evaluationResult']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!manuscriptId) {
      setData(null);
      setEvaluationResult(null);
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
      setEvaluationResult(workspace.evaluationResult);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
      setData(null);
      setEvaluationResult(null);
    } finally {
      setLoading(false);
    }
  }, [manuscriptId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    evaluationResult,
    loading,
    error,
    reload: load,
  };
}
