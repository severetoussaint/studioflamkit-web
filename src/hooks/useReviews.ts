import { useCallback, useEffect, useState } from 'react';
import type { Review } from '@/types/domain.types';
import {
  createReview,
  discardReview,
  listReviewsByProject,
  resolveReview,
} from '@/services/review.service';
import type { CreateReviewInput } from '@/services/review.service';

export interface UseReviewsState {
  data: Review[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  create: (input: CreateReviewInput) => Promise<Review>;
  resolve: (reviewId: string) => Promise<Review>;
  discard: (reviewId: string) => Promise<Review>;
}

export function useReviews(projectId: string | null): UseReviewsState {
  const [data, setData] = useState<Review[]>([]);
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
      setData(await listReviewsByProject(projectId));
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Async review synchronization intentionally updates local state after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const create = useCallback(async (input: CreateReviewInput) => {
    const review = await createReview(input);
    await reload();
    return review;
  }, [reload]);

  const resolve = useCallback(async (reviewId: string) => {
    const review = await resolveReview(reviewId);
    await reload();
    return review;
  }, [reload]);

  const discard = useCallback(async (reviewId: string) => {
    const review = await discardReview(reviewId);
    await reload();
    return review;
  }, [reload]);

  return { data, loading, error, reload, create, resolve, discard };
}
