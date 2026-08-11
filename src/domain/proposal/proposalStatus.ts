import type { ProposalStatus } from '@/types/domain.types';

/** Canonical proposal-state sequence owned by the domain layer. */
export const PROPOSAL_STATUS_SEQUENCE: readonly ProposalStatus[] = [
  'pending',
  'accepted',
  'rejected',
  'expired',
] as const;

export function isProposalStatus(value: string | null | undefined): value is ProposalStatus {
  return value !== null
    && value !== undefined
    && PROPOSAL_STATUS_SEQUENCE.includes(value as ProposalStatus);
}
