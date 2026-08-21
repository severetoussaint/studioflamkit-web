-- Proposal conversation lifecycle
-- Backend migration applied to Supabase production.

alter table public.conversations
  add column if not exists proposal_id uuid references public.proposals(id) on delete cascade;

create unique index if not exists conversations_proposal_id_unique
  on public.conversations(proposal_id)
  where proposal_id is not null;

create or replace function app_private.send_proposal(p_proposal_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_proposal public.proposals%rowtype;
  v_author_id uuid;
  v_manuscript_title text;
  v_conversation_id uuid;
begin
  if not public.is_admin() then raise exception 'Only admins can send proposals'; end if;
  select * into v_proposal from public.proposals where id = p_proposal_id for update;
  if not found then raise exception 'Proposal % not found', p_proposal_id; end if;
  if v_proposal.status <> 'pending' then raise exception 'Proposal % is not pending (status=%)', p_proposal_id, v_proposal.status; end if;
  if v_proposal.sent_at is not null then raise exception 'Proposal % has already been sent', p_proposal_id; end if;
  select m.author_id, m.title into v_author_id, v_manuscript_title
  from public.project_requests pr join public.manuscripts m on m.id = pr.manuscript_id
  where pr.id = v_proposal.request_id;
  if v_author_id is null then raise exception 'Author not found for proposal %', p_proposal_id; end if;
  update public.proposals set sent_at = now() where id = p_proposal_id and status = 'pending' and sent_at is null;
  if not found then raise exception 'Proposal % could not be sent', p_proposal_id; end if;
  insert into public.conversations(author_id, project_id, proposal_id, type, subject, status)
  values (v_author_id, null, p_proposal_id, 'proposal', coalesce('Propuesta de producción — ' || nullif(trim(v_manuscript_title), ''), 'Propuesta de producción'), 'open')
  on conflict (proposal_id) where proposal_id is not null do update set updated_at = now()
  returning id into v_conversation_id;
  insert into public.notifications(author_id, title, message, status, conversation_id)
  values (v_author_id, 'Nueva propuesta disponible', 'Studio FLAMKIT ha preparado una propuesta de producción para tu obra. Puedes revisarla y conversar sobre ella desde Mensajes.', 'sent', v_conversation_id);
  return p_proposal_id;
end; $$;

create or replace function app_private.accept_proposal(p_proposal_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_proposal public.proposals%rowtype;
  v_request public.project_requests%rowtype;
  v_project public.projects%rowtype;
  v_author_id uuid;
  v_project_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_proposal from public.proposals where id=p_proposal_id for update;
  if not found then raise exception 'Proposal % not found', p_proposal_id; end if;
  select pr.* into v_request from public.project_requests pr where pr.id=v_proposal.request_id for update;
  if not found then raise exception 'Request % not found for proposal %', v_proposal.request_id, p_proposal_id; end if;
  select m.author_id into v_author_id from public.manuscripts m where m.id=v_request.manuscript_id;
  if v_author_id is null then raise exception 'Author not found for manuscript %', v_request.manuscript_id; end if;
  if not (public.is_admin() or v_author_id=auth.uid()) then raise exception 'Not authorized to accept proposal %', p_proposal_id; end if;
  if v_proposal.status='accepted' then
    select * into v_project from public.projects where proposal_id=p_proposal_id limit 1;
    if found then update public.conversations set project_id=v_project.id, updated_at=now() where proposal_id=p_proposal_id; return v_project.id; end if;
    raise exception 'Proposal % is accepted but has no linked project', p_proposal_id;
  end if;
  if v_proposal.status<>'pending' then raise exception 'Proposal % is not pending (status=%)', p_proposal_id, v_proposal.status; end if;
  if v_proposal.expires_at is not null and v_proposal.expires_at<now() then update public.proposals set status='expired' where id=p_proposal_id and status='pending'; return null; end if;
  select * into v_project from public.projects where manuscript_id=v_request.manuscript_id for update;
  if found then
    if v_project.proposal_id is not null and v_project.proposal_id<>p_proposal_id then raise exception 'Manuscript % already belongs to project % linked to another proposal', v_request.manuscript_id, v_project.id; end if;
    v_project_id:=v_project.id;
    update public.projects set proposal_id=p_proposal_id, updated_at=now() where id=v_project_id;
  else
    insert into public.projects(author_id,manuscript_id,proposal_id,status) values(v_author_id,v_request.manuscript_id,p_proposal_id,'planning') returning id into v_project_id;
  end if;
  update public.proposals set status='accepted' where id=p_proposal_id and status='pending';
  if not found then raise exception 'Proposal % changed before acceptance completed', p_proposal_id; end if;
  update public.project_requests set status='accepted' where id=v_request.id;
  update public.conversations set project_id=v_project_id, updated_at=now() where proposal_id=p_proposal_id;
  if not exists(select 1 from public.timeline where project_id=v_project_id and event='proposal_accepted') then
    insert into public.timeline(project_id,event,details) values(v_project_id,'proposal_accepted',format('Proposal %s accepted and linked to project %s',p_proposal_id,v_project_id));
  end if;
  insert into public.notifications(author_id,title,message,status,conversation_id)
  values(v_author_id,'Propuesta aceptada','La propuesta ha sido aceptada y tu proyecto ha quedado vinculado correctamente.','sent',(select id from public.conversations where proposal_id=p_proposal_id limit 1));
  return v_project_id;
end; $$;
