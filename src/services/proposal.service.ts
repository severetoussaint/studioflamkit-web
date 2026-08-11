import { supabaseClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/types/database.types';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import { mapProposalRowToDomain } from '@/domain/proposal/mapProposal';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];
type ProposalRpcName = 'send_proposal' | 'accept_proposal' | 'reject_proposal' | 'expire_proposal';

async function callProposalRpc(name: ProposalRpcName, proposalId: string): Promise<string> {
  const { data, error } = await supabaseClient.rpc(name, { p_proposal_id: proposalId });
  if (error) throw error;
  return data;
}

export interface CreateProposalInput {
  requestId: string;
  amount: number;
  currency?: string | null;
  services?: Json | null;
  revisionsIncluded?: number | null;
  deadline?: string | null;
  expiresAt?: string | null;
}

function assertPendingStatus(proposal: Proposal) {
  if (proposal.status !== 'pending') {
    throw new Error(`Proposal ${proposal.id} is not mutable from status ${proposal.status}.`);
  }
}

function assertExpired(proposal: Proposal) {
  if (!proposal.expiresAt) {
    throw new Error(`Proposal ${proposal.id} has no expiration date.`);
  }

  if (new Date(proposal.expiresAt).getTime() >= Date.now()) {
    throw new Error(`Proposal ${proposal.id} has not expired yet.`);
  }
}

export async function listProposals(requestId?: string): Promise<Proposal[]> {
  let query = supabaseClient
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (requestId) query = query.eq('request_id', requestId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProposalRowToDomain);
}

export async function getProposal(proposalId: string): Promise<Proposal | null> {
  const { data, error } = await supabaseClient
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProposalRowToDomain(data) : null;
}

export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  if (!input.requestId) throw new Error('requestId is required to create a proposal.');
  if (!Number.isFinite(input.amount) || input.amount < 0) throw new Error('Proposal amount must be a non-negative number.');
  if (input.services == null) throw new Error('Proposal services are required.');

  const { data, error } = await supabaseClient
    .from('proposals')
    .insert({
      request_id: input.requestId,
      amount: input.amount,
      currency: input.currency ?? 'USD',
      services: input.services,
      revisions_included: input.revisionsIncluded ?? 0,
      deadline: input.deadline ?? null,
      expires_at: input.expiresAt ?? null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapProposalRowToDomain(data);
}

export async function sendProposal(proposalId: string): Promise<Proposal> {
  const persistedProposalId = await callProposalRpc('send_proposal', proposalId);
  const proposal = await getProposal(persistedProposalId);
  if (!proposal) throw new Error(`Proposal ${persistedProposalId} not found after sending.`);
  return proposal;
}

export async function acceptProposal(proposalId: string): Promise<Proposal> {
  const persistedProjectId = await callProposalRpc('accept_proposal', proposalId);
  if (!persistedProjectId) throw new Error(`Proposal ${proposalId} could not be accepted.`);

  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found after acceptance.`);
  return proposal;
}

export async function rejectProposal(proposalId: string): Promise<Proposal> {
  const persistedProposalId = await callProposalRpc('reject_proposal', proposalId);
  const proposal = await getProposal(persistedProposalId);
  if (!proposal) throw new Error(`Proposal ${persistedProposalId} not found after rejection.`);
  return proposal;
}

export async function expireProposal(proposalId: string): Promise<Proposal> {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);

  assertPendingStatus(proposal);
  assertExpired(proposal);

  const persistedProposalId = await callProposalRpc('expire_proposal', proposalId);
  const persistedProposal = await getProposal(persistedProposalId);
  if (!persistedProposal) throw new Error(`Proposal ${persistedProposalId} not found after expiration.`);
  return persistedProposal;
}

export async function getProposalStatus(proposalId: string): Promise<ProposalStatus | null> {
  const proposal = await getProposal(proposalId);
  return proposal?.status ?? null;
}