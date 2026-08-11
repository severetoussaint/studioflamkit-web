import type { Database } from '@/types/database.types';
import type { ProjectRequest } from '@/types/domain.types';
import { isRequestStatus } from '@/domain/request/requestStatus';

type ProjectRequestRow = Database['public']['Tables']['project_requests']['Row'];

export function mapProjectRequestRowToDomain(row: ProjectRequestRow): ProjectRequest {
  return {
    id: row.id,
    manuscriptId: row.manuscript_id,
    channel: row.channel,
    status: isRequestStatus(row.status) ? row.status : 'pending',
    createdAt: row.created_at ?? '',
  };
}
