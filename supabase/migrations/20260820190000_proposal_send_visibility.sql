alter table public.proposals add column if not exists sent_at timestamptz;

alter table public.proposals drop constraint if exists proposals_status_check;
alter table public.proposals add constraint proposals_status_check check (status = any (array['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]));

update public.proposals
set sent_at = coalesce(sent_at, created_at)
where status in ('pending','accepted','rejected','expired') and sent_at is null;

drop policy if exists proposals_owner_select on public.proposals;
create policy proposals_owner_select
  on public.proposals
  for select
  to public
  using (
    is_admin()
    or (
      sent_at is not null
      and exists (
        select 1
        from public.project_requests r
        join public.manuscripts m on m.id = r.manuscript_id
        where r.id = proposals.request_id
          and m.author_id = auth.uid()
      )
    )
  );

create or replace function app_private.send_proposal(p_proposal_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.proposals%rowtype;
  v_author_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can send proposals';
  end if;

  select * into v_proposal
  from public.proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Proposal % not found', p_proposal_id;
  end if;

  if v_proposal.status <> 'pending' then
    raise exception 'Proposal % is not pending (status=%)', p_proposal_id, v_proposal.status;
  end if;

  if v_proposal.sent_at is not null then
    raise exception 'Proposal % has already been sent', p_proposal_id;
  end if;

  select m.author_id into v_author_id
  from public.project_requests pr
  join public.manuscripts m on m.id = pr.manuscript_id
  where pr.id = v_proposal.request_id;

  if v_author_id is null then
    raise exception 'Author not found for proposal %', p_proposal_id;
  end if;

  update public.proposals
  set sent_at = now()
  where id = p_proposal_id and status = 'pending' and sent_at is null;

  if not found then
    raise exception 'Proposal % could not be sent', p_proposal_id;
  end if;

  insert into public.notifications(author_id, title, message, status)
  values (
    v_author_id,
    'Nueva propuesta disponible',
    format('Tienes una nueva propuesta disponible (ID %s). Revisa sus condiciones en tu Dashboard.', p_proposal_id),
    'sent'
  );

  return p_proposal_id;
end;
$$;

create or replace function public.send_proposal(p_proposal_id uuid)
returns uuid
language plpgsql
set search_path = public, app_private
as $$
begin
  return app_private.send_proposal(p_proposal_id);
end;
$$;
