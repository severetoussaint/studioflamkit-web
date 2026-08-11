import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { TimelineEntry, TimelineEvent } from '@/types/domain.types';
import { isTimelineEvent } from '@/domain/timeline/timelineEvent';

type TimelineRow = Database['public']['Tables']['timeline']['Row'];

function mapTimelineEvent(value: string): TimelineEvent {
  return isTimelineEvent(value) ? value : 'project_stage_changed';
}

function requireTimelineString(value: string | null, field: string): string {
  if (value === null) {
    throw new Error(`Invalid timeline row: ${field} is null.`);
  }
  return value;
}

function mapTimelineRowToDomain(row: TimelineRow): TimelineEntry {
  return {
    id: requireTimelineString(row.id, 'id'),
    projectId: requireTimelineString(row.project_id, 'project_id'),
    event: mapTimelineEvent(row.event),
    details: row.details,
    createdAt: row.created_at ?? '',
  };
}

export async function listProjectTimeline(projectId: string): Promise<TimelineEntry[]> {
  if (!projectId) return [];

  const { data, error } = await supabaseClient
    .from('timeline')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTimelineRowToDomain);
}

export async function hasTimelineEvent(
  projectId: string,
  event: TimelineEvent,
  details?: string | null,
): Promise<boolean> {
  if (!projectId) return false;

  let query = supabaseClient
    .from('timeline')
    .select('id')
    .eq('project_id', projectId)
    .eq('event', event)
    .limit(1);

  if (details === undefined) {
    // Event-level deduplication is intentionally supported for stable, unique milestones.
  } else if (details === null) {
    query = query.is('details', null);
  } else {
    query = query.eq('details', details);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function addTimelineEvent(
  projectId: string,
  event: TimelineEvent,
  details?: string | null,
): Promise<TimelineEntry> {
  if (!projectId) throw new Error('projectId is required to add a timeline event.');
  if (!isTimelineEvent(event)) throw new Error(`Invalid timeline event: ${event}`);

  const { data, error } = await supabaseClient
    .from('timeline')
    .insert({
      project_id: projectId,
      event,
      details: details ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapTimelineRowToDomain(data);
}
