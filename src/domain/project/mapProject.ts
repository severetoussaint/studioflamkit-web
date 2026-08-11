import type { Database } from '@/types/database.types';
import type { Project } from '@/types/domain.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

/**
 * Maps the persisted Supabase project row into the shared domain model.
 *
 * This mapper intentionally contains no UI concerns and performs no I/O.
 */
export function mapProjectRowToDomain(row: ProjectRow): Project {
  return {
    id: row.id,
    authorId: row.author_id,
    manuscriptId: row.manuscript_id,
    proposalId: row.proposal_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
