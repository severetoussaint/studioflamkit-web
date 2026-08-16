import { useCallback, useEffect, useState } from 'react';
import type { Notification } from '@/types/domain.types';
import { supabaseClient } from '@/lib/supabase/client';
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
    let ignore = false;

    async function fetchNotifs() {
      if (!userId) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const notifs = await getUserNotifications(userId);
        if (!ignore) setData(notifs);
      } catch (cause) {
        const nextError = cause instanceof Error ? cause : new Error(String(cause));
        if (!ignore) setError(nextError);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void fetchNotifs();

    if (!userId) {
      return () => {
        ignore = true;
      };
    }

    // Realtime channel listener for live notifications
    const channel = supabaseClient
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `author_id=eq.${userId}`,
        },
        () => {
          void fetchNotifs();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      void supabaseClient.removeChannel(channel);
    };
  }, [userId]);

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
