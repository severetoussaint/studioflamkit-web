import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * Fetch real notifications for a given user (Author or Admin)
 */
export async function getUserNotifications(userId: string): Promise<NotificationRow[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Error fetching notifications from Supabase:', error);
      return [];
    }

    return (data ?? []) as NotificationRow[];
  } catch (err) {
    console.error('Unexpected error in getUserNotifications:', err);
    return [];
  }
}

/**
 * Mark a single notification as read in Supabase
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  if (!id) return false;
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', id);

    if (error) {
      console.warn('Error marking notification as read in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in markNotificationAsRead:', err);
    return false;
  }
}

/**
 * Mark all unread notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ status: 'read' })
      .eq('author_id', userId)
      .eq('status', 'unread');

    if (error) {
      console.warn('Error marking all notifications as read in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in markAllNotificationsAsRead:', err);
    return false;
  }
}
