import { supabaseClient } from '@/lib/supabase/client';
import type { Json } from '@/types/database.types';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import { mapProposalRowToDomain } from '@/domain/proposal/mapProposal';
import { createNotification } from '@/services/notification.service';

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
  services?: unknown;
  revisionsIncluded?: number | null;
  deadline?: string | null;
  expiresAt?: string | null;
}

export type UpdateProposalInput = Omit<CreateProposalInput, 'requestId'>;

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

export async function listProposalsForAuthor(authorId: string): Promise<Proposal[]> {
  if (!authorId) return [];

  const { data, error } = await supabaseClient
    .from('proposals')
    .select('*, project_requests!inner(manuscripts!inner(author_id))')
    .eq('project_requests.manuscripts.author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapProposalRowToDomain(row));
}

export async function getCurrentProposalForRequest(requestId: string): Promise<Proposal | null> {
  const proposals = await listProposals(requestId);
  return proposals.find((proposal) => proposal.status === 'pending')
    ?? proposals.find((proposal) => proposal.status === 'accepted')
    ?? proposals[0]
    ?? null;
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

function validateProposalInput(input: UpdateProposalInput) {
  if (!Number.isFinite(input.amount) || input.amount < 0) throw new Error('Proposal amount must be a non-negative number.');
  if (input.services == null) throw new Error('Proposal services are required.');
}

interface ProposalMutationRow {
  amount: number;
  currency: string;
  services: Json | null;
  revisions_included: number;
  deadline: string | null;
  expires_at: string | null;
}

function toProposalJson(value: unknown): Json | null {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value)) as Json;
}

function mapProposalMutation(input: UpdateProposalInput): ProposalMutationRow {
  return {
    amount: input.amount,
    currency: input.currency ?? 'USD',
    services: toProposalJson(input.services),
    revisions_included: input.revisionsIncluded ?? 0,
    deadline: input.deadline ?? null,
    expires_at: input.expiresAt ?? null,
  };
}

export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  if (!input.requestId) throw new Error('requestId is required to create a proposal.');
  validateProposalInput(input);

  const existing = await getCurrentProposalForRequest(input.requestId);
  if (existing?.status === 'pending') {
    throw new Error(`A pending proposal already exists for request ${input.requestId}.`);
  }

  const { data, error } = await supabaseClient
    .from('proposals')
    .insert({
      request_id: input.requestId,
      ...mapProposalMutation(input),
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapProposalRowToDomain(data);
}

export async function updateProposal(proposalId: string, input: UpdateProposalInput): Promise<Proposal> {
  validateProposalInput(input);
  const current = await getProposal(proposalId);
  if (!current) throw new Error(`Proposal ${proposalId} not found.`);
  assertPendingStatus(current);

  const { data: sentRow } = await supabaseClient
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .maybeSingle();
  const sentAt = (sentRow as unknown as { sent_at?: string | null } | null)?.sent_at ?? null;
  if (sentAt) {
    throw new Error('Esta propuesta ya fue enviada al autor y no puede modificarse.');
  }

  const { data, error } = await supabaseClient
    .from('proposals')
    .update(mapProposalMutation(input))
    .eq('id', proposalId)
    .eq('status', 'pending')
    .select('*')
    .single();

  if (error) throw error;
  return mapProposalRowToDomain(data);
}

export async function sendProposal(proposalId: string): Promise<Proposal> {
  const proposalBeforeSend = await getProposal(proposalId);
  if (!proposalBeforeSend) throw new Error(`Proposal ${proposalId} not found.`);
  assertPendingStatus(proposalBeforeSend);

  const persistedProposalId = await callProposalRpc('send_proposal', proposalId);
  const proposal = await getProposal(persistedProposalId);
  if (!proposal) throw new Error(`Proposal ${persistedProposalId} not found after sending.`);

  return proposal;
}

export async function acceptProposal(proposalId: string): Promise<Proposal> {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);
  assertPendingStatus(proposal);
  if (proposal.expiresAt && new Date(proposal.expiresAt).getTime() < Date.now()) throw new Error('This proposal has expired and cannot be accepted.');

  const persistedProjectId = await callProposalRpc('accept_proposal', proposalId);
  if (!persistedProjectId) throw new Error(`Proposal ${proposalId} could not be accepted.`);

  const accepted = await getProposal(proposalId);
  if (!accepted) throw new Error(`Proposal ${proposalId} not found after acceptance.`);

  try {
    const { data: propData } = await supabaseClient
      .from('proposals')
      .select('project_requests(manuscripts(author_id))')
      .eq('id', proposalId)
      .maybeSingle();
    interface ProposalAuthorQueryResult { project_requests?: { manuscripts?: { author_id?: string } | null } | null }
    const authorId = (propData as unknown as ProposalAuthorQueryResult | null)?.project_requests?.manuscripts?.author_id;
    if (authorId) {
      await createNotification({
        authorId,
        title: 'Propuesta aceptada con éxito',
        message: 'Has aprobado la propuesta editorial. Tu obra ha entrado formalmente en el plan de producción.',
        status: 'pending',
      });
    }
  } catch (err) {
    console.warn('Failed to create notification for accepted proposal:', err);
  }

  return accepted;
}

export async function rejectProposal(proposalId: string): Promise<Proposal> {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);
  assertPendingStatus(proposal);
  const persistedProposalId = await callProposalRpc('reject_proposal', proposalId);
  const rejected = await getProposal(persistedProposalId);
  if (!rejected) throw new Error(`Proposal ${persistedProposalId} not found after rejection.`);
  return rejected;
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
