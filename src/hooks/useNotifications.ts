import { useCallback, useEffect, useState } from 'react';
import type { Notification } from '@/types/domain.types';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/notification.service';

export interface UseNotificationsState {
  data: Notification[];
  loading: boolean;
  error: Error | null;
  unreadCount: number;
  reload: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

export function useNotifications(userId: string | null): UseNotificationsState {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setData(await getUserNotifications(userId));
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) await reload();
    return success;
  }, [reload]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;
    const success = await markAllNotificationsAsRead(userId);
    if (success) await reload();
    return success;
  }, [reload, userId]);

  const unreadCount = data.filter((notification) => notification.status !== 'read').length;

  return { data, loading, error, unreadCount, reload, markAsRead, markAllAsRead };
}
