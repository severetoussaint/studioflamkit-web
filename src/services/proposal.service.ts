import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import { mapProposalRowToDomain } from '@/domain/proposal/mapProposal';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

export interface CreateProposalInput {
  requestId: string;
  amount: number;
  currency?: string | null;
  services?: unknown | null;
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

  if (requestId) {
    query = query.eq('request_id', requestId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return ((data ?? []) as ProposalRow[]).map(mapProposalRowToDomain);
}

export async function getProposal(proposalId: string): Promise<Proposal | null> {
  const { data, error } = await supabaseClient
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProposalRowToDomain(data as ProposalRow) : null;
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
    } as never)
    .select('*')
    .single();

  if (error) throw error;
  return mapProposalRowToDomain(data as ProposalRow);
}

export async function rejectProposal(proposalId: string): Promise<Proposal> {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);

  assertPendingStatus(proposal);

  const { data, error } = await supabaseClient
    .from('proposals')
    .update({ status: 'rejected' })
    .eq('id', proposalId)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) throw error;
  return mapProposalRowToDomain(data as ProposalRow);
}

export async function expireProposal(proposalId: string): Promise<Proposal> {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);

  assertPendingStatus(proposal);
  assertExpired(proposal);

  const { data, error } = await supabaseClient
    .from('proposals')
    .update({ status: 'expired' })
    .eq('id', proposalId)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) throw error;
  return mapProposalRowToDomain(data as ProposalRow);
}

/**
 * Sending is intentionally not implemented yet because `proposals.status` has
 * no `sent` state. Adding a transient state here would create a second semantic
 * model instead of matching the real Supabase contract.
 */
export async function sendProposal(_proposalId: string): Promise<never> {
  throw new Error('sendProposal is blocked: proposals.status has no sent state in the current Supabase schema.');
}

/**
 * Acceptance is intentionally blocked until the existing Supabase trigger
 * `sync_projects_from_accepted_request` is reconciled with the 1B2.5 contract.
 * That trigger creates projects with proposal_id = NULL when a request is
 * accepted, so a multi-write implementation here would not be atomic.
 */
export async function acceptProposal(_proposalId: string): Promise<never> {
  throw new Error('acceptProposal is blocked: request acceptance currently competes with the Supabase project-creation trigger.');
}

export async function getProposalStatus(proposalId: string): Promise<ProposalStatus | null> {
  const proposal = await getProposal(proposalId);
  return proposal?.status ?? null;
}
