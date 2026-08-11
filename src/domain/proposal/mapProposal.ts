import type { Database } from '@/types/database.types';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import { isProposalStatus } from '@/domain/proposal/proposalStatus';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

export function mapProposalRowToDomain(row: ProposalRow): Proposal {
  const status: ProposalStatus = isProposalStatus(row.status) ? row.status : 'pending';

  return {
    id: row.id,
    requestId: row.request_id,
    amount: Number(row.amount),
    currency: row.currency,
    services: row.services,
    revisionsIncluded: row.revisions_included,
    deadline: row.deadline,
    status,
    expiresAt: row.expires_at,
    createdAt: row.created_at ?? '',
  };
}
