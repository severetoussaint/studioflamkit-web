import type { Database } from '@/types/database.types';
import type { Project, ProjectStatus } from '@/types/domain.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

const PROJECT_STATUSES: ReadonlySet<string> = new Set([
  'planning',
  'production',
  'review',
  'completed',
  'archived',
]);

function mapProjectStatus(value: string | null): ProjectStatus {
  if (value !== null && PROJECT_STATUSES.has(value)) {
    return value as ProjectStatus;
  }
  return 'planning';
}

function requireProjectString(value: string | null, field: string): string {
  if (value === null) {
    throw new Error(`Invalid projects row: ${field} is null.`);
  }
  return value;
}

export function mapProjectRowToDomain(row: ProjectRow): Project {
  return {
    id: row.id,
    authorId: requireProjectString(row.author_id, 'author_id'),
    manuscriptId: requireProjectString(row.manuscript_id, 'manuscript_id'),
    proposalId: row.proposal_id,
    status: mapProjectStatus(row.status),
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}
