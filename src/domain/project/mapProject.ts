import type { Database } from '@/types/database.types';
import type { Project, ProjectStatus } from '@/types/domain.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'planning',
  'production',
  'review',
  'completed',
  'archived',
];

function mapProjectStatus(value: string | null): ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : 'planning';
}

/**
 * Maps the persisted Supabase project row into the shared domain model.
 * This is the schema/domain boundary: nullable persisted values are normalized here.
 */
export function mapProjectRowToDomain(row: ProjectRow): Project {
  return {
    id: row.id,
    authorId: row.author_id,
    manuscriptId: row.manuscript_id,
    proposalId: row.proposal_id,
    status: mapProjectStatus(row.status),
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}
