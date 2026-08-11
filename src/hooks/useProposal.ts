import { useCallback, useEffect, useState } from 'react';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import {
  acceptProposal,
  createProposal,
  expireProposal,
  getCurrentProposalForRequest,
  getProposal,
  rejectProposal,
  sendProposal,
} from '@/services/proposal.service';
import type { CreateProposalInput } from '@/services/proposal.service';

export interface UseProposalState {
  data: Proposal | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  create: (input: CreateProposalInput) => Promise<Proposal>;
  send: () => Promise<Proposal>;
  accept: () => Promise<Proposal>;
  reject: () => Promise<Proposal>;
  expire: () => Promise<Proposal>;
}

export interface UseProposalOptions {
  proposalId?: string | null;
  requestId?: string | null;
}

export function useProposal({ proposalId = null, requestId = null }: UseProposalOptions): UseProposalState {
  const [data, setData] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!proposalId && !requestId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const proposal = proposalId
        ? await getProposal(proposalId)
        : await getCurrentProposalForRequest(requestId as string);
      setData(proposal);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [proposalId, requestId]);

  useEffect(() => {
    // Async proposal synchronization intentionally updates local state after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const create = useCallback(async (input: CreateProposalInput) => {
    const proposal = await createProposal(input);
    setData(proposal);
    return proposal;
  }, []);

  const requireProposalId = useCallback(() => {
    if (!data?.id) throw new Error('A proposal is required for this action.');
    return data.id;
  }, [data]);

  const runMutation = useCallback(async (
    mutation: (proposalId: string) => Promise<Proposal>,
  ) => {
    const proposal = await mutation(requireProposalId());
    setData(proposal);
    return proposal;
  }, [requireProposalId]);

  const send = useCallback(() => runMutation(sendProposal), [runMutation]);
  const accept = useCallback(() => runMutation(acceptProposal), [runMutation]);
  const reject = useCallback(() => runMutation(rejectProposal), [runMutation]);
  const expire = useCallback(() => runMutation(expireProposal), [runMutation]);

  return { data, loading, error, reload, create, send, accept, reject, expire };
}

export type CurrentProposalStatus = ProposalStatus;
