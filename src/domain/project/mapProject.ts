import type { Database } from '@/types/database.types';
import type { Project } from '@/types/domain.types';
import { isProjectStatus } from '@/domain/project/projectStatus';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

function mapProjectStatus(value: string | null) {
  return isProjectStatus(value) ? value : 'planning';
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
