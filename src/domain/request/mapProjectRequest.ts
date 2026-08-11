import type { Database } from '@/types/database.types';
import type { ProjectRequest, RequestStatus } from '@/types/domain.types';

type ProjectRequestRow = Database['public']['Tables']['project_requests']['Row'];

const REQUEST_STATUSES: ReadonlySet<string> = new Set([
  'pending',
  'evaluating',
  'accepted',
  'rejected',
  'canceled',
]);

function mapRequestStatus(value: string | null): RequestStatus {
  if (value !== null && REQUEST_STATUSES.has(value)) {
    return value as RequestStatus;
  }
  return 'pending';
}

export function mapProjectRequestRowToDomain(row: ProjectRequestRow): ProjectRequest {
  return {
    id: row.id,
    manuscriptId: row.manuscript_id,
    channel: row.channel,
    status: mapRequestStatus(row.status),
    createdAt: row.created_at ?? '',
  };
}
