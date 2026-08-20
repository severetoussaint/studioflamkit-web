import type { Database } from '@/types/database.types';
import type { Deliverable } from '@/types/domain.types';

type DeliverableRow = Database['public']['Tables']['deliverables']['Row'];

export function mapDeliverableRowToDomain(row: DeliverableRow): Deliverable {
  return {
    id: row.id,
    title: row.title,
    status: row.status ?? 'pending',
    createdAt: row.created_at ?? '',
  };
}
