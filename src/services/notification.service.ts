import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Notification, NotificationStatus } from '@/types/domain.types';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface CreateNotificationInput {
  authorId: string;
  title: string;
  message: string;
  status?: NotificationStatus;
}

const NOTIFICATION_STATUSES: ReadonlySet<string> = new Set(['pending', 'sent', 'read']);

function mapNotificationStatus(value: string | null): NotificationStatus {
  if (value !== null && NOTIFICATION_STATUSES.has(value)) {
    return value as NotificationStatus;
  }
  return 'pending';
}

function requireNotificationString(value: string | null, field: string): string {
  if (value === null) {
    throw new Error(`Invalid notifications row: ${field} is null.`);
  }
  return value;
}

function mapNotificationRowToDomain(row: NotificationRow): Notification {
  return {
    id: row.id,
    authorId: requireNotificationString(row.author_id, 'author_id'),
    title: requireNotificationString(row.title, 'title'),
    message: requireNotificationString(row.message, 'message'),
    status: mapNotificationStatus(row.status),
    createdAt: row.created_at ?? '',
  };
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
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

    return (data ?? []).map(mapNotificationRowToDomain);
  } catch (err) {
    console.error('Unexpected error in getUserNotifications:', err);
    return [];
  }
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  if (!input.authorId) throw new Error('authorId is required to create a notification.');
  if (!input.title.trim()) throw new Error('Notification title is required.');
  if (!input.message.trim()) throw new Error('Notification message is required.');

  const { data, error } = await supabaseClient
    .from('notifications')
    .insert({
      author_id: input.authorId,
      title: input.title,
      message: input.message,
      status: input.status ?? 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapNotificationRowToDomain(data);
}

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

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ status: 'read' })
      .eq('author_id', userId)
      .in('status', ['pending', 'sent']);

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
