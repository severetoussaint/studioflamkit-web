import type { Database } from '@/types/database.types';
import type { ProjectRequest, RequestStatus } from '@/types/domain.types';

type ProjectRequestRow = Database['public']['Tables']['project_requests']['Row'];

const REQUEST_STATUSES: readonly RequestStatus[] = [
  'pending',
  'evaluating',
  'accepted',
  'rejected',
  'canceled',
];

function mapRequestStatus(value: string | null): RequestStatus {
  return REQUEST_STATUSES.includes(value as RequestStatus)
    ? (value as RequestStatus)
    : 'pending';
}

/** Maps the persisted request row into the shared domain model. */
export function mapProjectRequestRowToDomain(row: ProjectRequestRow): ProjectRequest {
  return {
    id: row.id,
    manuscriptId: row.manuscript_id,
    channel: row.channel,
    status: mapRequestStatus(row.status),
    createdAt: row.created_at ?? '',
  };
}
