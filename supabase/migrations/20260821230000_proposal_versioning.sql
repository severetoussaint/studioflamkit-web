begin;

alter table public.proposals
  add column if not exists version integer not null default 1,
  add column if not exists parent_proposal_id uuid references public.proposals(id) on delete set null;

update public.proposals p
set version = 1
where version is null;

create unique index if not exists proposals_request_version_unique
  on public.proposals(request_id, version);

alter table public.proposals drop constraint if exists proposals_status_check;
alter table public.proposals add constraint proposals_status_check
  check (status = any (array['pending'::text,'accepted'::text,'rejected'::text,'expired'::text,'superseded'::text]));

create or replace function app_private.create_proposal_version(
  p_request_id uuid,
  p_source_proposal_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_request public.project_requests%rowtype;
  v_source public.proposals%rowtype;
  v_author_id uuid;
  v_version integer;
  v_proposal_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can create proposal versions';
  end if;

  select * into v_request
  from public.project_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request % not found', p_request_id;
  end if;

  if p_source_proposal_id is not null then
    select * into v_source
    from public.proposals
    where id = p_source_proposal_id
      and request_id = p_request_id
    for update;

    if not found then
      raise exception 'Source proposal % not found for request %', p_source_proposal_id, p_request_id;
    end if;

    if v_source.status = 'accepted' then
      raise exception 'Cannot create a new version from an accepted proposal';
    end if;
  else
    select * into v_source
    from public.proposals
    where request_id = p_request_id
    order by version desc
    limit 1
    for update;
  end if;

  select m.author_id into v_author_id
  from public.manuscripts m
  where m.id = v_request.manuscript_id;

  if v_author_id is null then
    raise exception 'Author not found for request %', p_request_id;
  end if;

  select coalesce(max(version), 0) + 1 into v_version
  from public.proposals
  where request_id = p_request_id;

  insert into public.proposals(
    request_id,
    amount,
    currency,
    services,
    revisions_included,
    deadline,
    status,
    expires_at,
    sent_at,
    version,
    parent_proposal_id
  )
  values(
    p_request_id,
    coalesce(v_source.amount, 0),
    coalesce(v_source.currency, 'USD'),
    v_source.services,
    coalesce(v_source.revisions_included, 2),
    v_source.deadline,
    'pending',
    null,
    null,
    v_version,
    case when p_source_proposal_id is not null then p_source_proposal_id else v_source.id end
  )
  returning id into v_proposal_id;

  update public.proposals
  set status = 'superseded'
  where request_id = p_request_id
    and id <> v_proposal_id
    and status = 'pending';

  return v_proposal_id;
end;
$function$;

create or replace function public.create_proposal_version(
  p_request_id uuid,
  p_source_proposal_id uuid default null
)
returns uuid
language sql
security invoker
set search_path = public, app_private
as $$
  select app_private.create_proposal_version(p_request_id, p_source_proposal_id);
$$;

grant execute on function public.create_proposal_version(uuid, uuid) to authenticated, service_role;
revoke execute on function public.create_proposal_version(uuid, uuid) from anon;

create or replace function app_private.send_proposal(p_proposal_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_proposal public.proposals%rowtype;
  v_author_id uuid;
  v_manuscript_title text;
  v_conversation_id uuid;
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

  if exists (
    select 1 from public.proposals p
    where p.request_id = v_proposal.request_id
      and p.status = 'pending'
      and p.id <> p_proposal_id
      and p.version > v_proposal.version
  ) then
    raise exception 'Proposal % is not the latest version', p_proposal_id;
  end if;

  if v_proposal.sent_at is not null then
    raise exception 'Proposal % has already been sent', p_proposal_id;
  end if;

  select m.author_id, m.title
    into v_author_id, v_manuscript_title
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

  insert into public.conversations(author_id, project_id, proposal_id, type, subject, status)
  values (
    v_author_id,
    null,
    p_proposal_id,
    'proposal',
    coalesce('Propuesta de producción v' || v_proposal.version || ' — ' || nullif(trim(v_manuscript_title), ''), 'Propuesta de producción v' || v_proposal.version),
    'open'
  )
  on conflict (proposal_id) where proposal_id is not null do update
    set updated_at = now()
  returning id into v_conversation_id;

  insert into public.notifications(author_id, title, message, status, conversation_id)
  values (
    v_author_id,
    'Nueva propuesta disponible',
    format('Studio FLAMKIT ha preparado la propuesta v%s para tu obra. Puedes revisarla y conversar sobre ella desde Mensajes.', v_proposal.version),
    'sent',
    v_conversation_id
  );

  return p_proposal_id;
end;
$function$;

commit;
