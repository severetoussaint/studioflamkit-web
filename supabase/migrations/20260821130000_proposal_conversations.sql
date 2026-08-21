-- Proposal conversation lifecycle
-- Backend migration applied to Supabase production.

alter table public.conversations
  add column if not exists proposal_id uuid references public.proposals(id) on delete cascade;

create unique index if not exists conversations_proposal_id_unique
  on public.conversations(proposal_id)
  where proposal_id is not null;

-- send_proposal: publish the proposal and ensure one proposal conversation exists.
-- accept_proposal: link that conversation to the created/linked project.
