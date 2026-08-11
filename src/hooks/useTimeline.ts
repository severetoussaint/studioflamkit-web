import { useCallback, useEffect, useState } from 'react';
import type { TimelineEntry } from '@/types/domain.types';
import { listProjectTimeline } from '@/services/timeline.service';

export interface UseTimelineState {
  data: TimelineEntry[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useTimeline(projectId: string | null): UseTimelineState {
  const [data, setData] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setData(await listProjectTimeline(projectId));
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Async timeline synchronization intentionally updates local state after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
