import type { Database } from '@/types/database.types';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import { isProposalStatus } from '@/domain/proposal/proposalStatus';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];
type ProposalRowWithSentAt = ProposalRow & { sent_at?: string | null };

export function mapProposalRowToDomain(row: ProposalRow): Proposal {
  const typedRow = row as ProposalRowWithSentAt;
  const status: ProposalStatus = isProposalStatus(typedRow.status) ? typedRow.status : 'pending';

  return {
    id: typedRow.id,
    requestId: typedRow.request_id,
    amount: Number(typedRow.amount),
    currency: typedRow.currency,
    services: typedRow.services,
    revisionsIncluded: typedRow.revisions_included,
    deadline: typedRow.deadline,
    status,
    expiresAt: typedRow.expires_at,
    sentAt: typedRow.sent_at ?? null,
    createdAt: typedRow.created_at ?? '',
    version: typeof typedRow.version === 'number' && typedRow.version > 0 ? typedRow.version : 1,
    parentProposalId: typedRow.parent_proposal_id ?? null,
  };
}
