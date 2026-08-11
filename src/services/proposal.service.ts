import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { Proposal } from '@/types/domain.types';
import { mapProposalRowToDomain } from '@/domain/proposal/mapProposal';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

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
