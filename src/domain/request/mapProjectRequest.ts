import type { Database } from '@/types/database.types';
import type { ProjectRequest } from '@/types/domain.types';

type ProjectRequestRow = Database['public']['Tables']['project_requests']['Row'];

/** Maps the persisted request row into the shared domain model. */
export function mapProjectRequestRowToDomain(row: ProjectRequestRow): ProjectRequest {
  return {
    id: row.id,
    manuscriptId: row.manuscript_id,
    channel: row.channel,
    status: row.status,
    createdAt: row.created_at ?? '',
  };
}
