import type { Database } from '@/types/database.types';
import type { Proposal, ProposalStatus } from '@/types/domain.types';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

const PROPOSAL_STATUSES: ReadonlySet<string> = new Set([
  'pending',
  'accepted',
  'rejected',
  'expired',
]);

function mapProposalStatus(value: string | null): ProposalStatus {
  if (value !== null && PROPOSAL_STATUSES.has(value)) {
    return value as ProposalStatus;
  }
  return 'pending';
}

export function mapProposalRowToDomain(row: ProposalRow): Proposal {
  return {
    id: row.id,
    requestId: row.request_id,
    amount: Number(row.amount),
    currency: row.currency,
    services: row.services,
    revisionsIncluded: row.revisions_included,
    deadline: row.deadline,
    status: mapProposalStatus(row.status),
    expiresAt: row.expires_at,
    createdAt: row.created_at ?? '',
  };
}
