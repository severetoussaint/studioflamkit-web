begin;

alter table public.payment_plans
  add column if not exists proposal_id uuid references public.proposals(id),
  add column if not exists currency text not null default 'USD',
  add column if not exists provider text not null default 'paypal',
  add column if not exists provider_order_id text,
  add column if not exists provider_capture_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists payment_plans_proposal_id_unique
  on public.payment_plans(proposal_id) where proposal_id is not null;
create unique index if not exists payment_plans_provider_order_id_unique
  on public.payment_plans(provider_order_id) where provider_order_id is not null;
create unique index if not exists payment_plans_provider_capture_id_unique
  on public.payment_plans(provider_capture_id) where provider_capture_id is not null;
create index if not exists payment_plans_project_status_idx
  on public.payment_plans(project_id, status);

create or replace function app_private.accept_proposal(p_proposal_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_proposal public.proposals%rowtype;
  v_request public.project_requests%rowtype;
  v_project public.projects%rowtype;
  v_author_id uuid;
  v_project_id uuid;
  v_conversation_id uuid;
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
    if not found then raise exception 'Proposal % is accepted but has no linked project', p_proposal_id; end if;
    v_project_id := v_project.id;
    update public.conversations set project_id=v_project_id, updated_at=now() where proposal_id=p_proposal_id;

    if not exists (select 1 from public.payment_plans where proposal_id=p_proposal_id) then
      insert into public.payment_plans(project_id,proposal_id,installment_number,percentage,amount,currency,provider,status)
      values(v_project_id,p_proposal_id,1,100,v_proposal.amount,coalesce(v_proposal.currency,'USD'),'paypal','pending');
    end if;
    return v_project_id;
  end if;

  if v_proposal.status<>'pending' then raise exception 'Proposal % is not pending (status=%)', p_proposal_id, v_proposal.status; end if;
  if v_proposal.expires_at is not null and v_proposal.expires_at<now() then
    update public.proposals set status='expired' where id=p_proposal_id and status='pending';
    return null;
  end if;

  select * into v_project from public.projects where manuscript_id=v_request.manuscript_id for update;
  if found then
    if v_project.proposal_id is not null and v_project.proposal_id<>p_proposal_id then
      raise exception 'Manuscript % already belongs to project % linked to another proposal', v_request.manuscript_id, v_project.id;
    end if;
    v_project_id:=v_project.id;
    update public.projects set proposal_id=p_proposal_id, updated_at=now() where id=v_project_id;
  else
    insert into public.projects(author_id,manuscript_id,proposal_id,status)
    values(v_author_id,v_request.manuscript_id,p_proposal_id,'planning')
    returning id into v_project_id;
  end if;

  update public.proposals set status='accepted' where id=p_proposal_id and status='pending';
  if not found then raise exception 'Proposal % changed before acceptance completed', p_proposal_id; end if;
  update public.project_requests set status='accepted' where id=v_request.id;
  update public.conversations set project_id=v_project_id, updated_at=now() where proposal_id=p_proposal_id;

  insert into public.payment_plans(project_id,proposal_id,installment_number,percentage,amount,currency,provider,status)
  values(v_project_id,p_proposal_id,1,100,v_proposal.amount,coalesce(v_proposal.currency,'USD'),'paypal','pending')
  on conflict (proposal_id) where proposal_id is not null do update
  set project_id=excluded.project_id, percentage=100, amount=excluded.amount,
      currency=excluded.currency, provider='paypal', updated_at=now();

  select id into v_conversation_id from public.conversations where proposal_id=p_proposal_id limit 1;

  if not exists(select 1 from public.timeline where project_id=v_project_id and event='proposal_accepted') then
    insert into public.timeline(project_id,event,details)
    values(v_project_id,'proposal_accepted',format('Proposal %s accepted and linked to project %s',p_proposal_id,v_project_id));
  end if;

  if not exists(select 1 from public.timeline where project_id=v_project_id and event='payment_pending') then
    insert into public.timeline(project_id,event,details)
    values(v_project_id,'payment_pending',format('Full payment of %s %s is required before production begins.',v_proposal.amount,coalesce(v_proposal.currency,'USD')));
  end if;

  insert into public.notifications(author_id,title,message,status,conversation_id)
  values(v_author_id,'Propuesta aceptada — pago pendiente',
    format('Has aceptado la propuesta. Completa el pago total de %s %s para que Studio FLAMKIT pueda iniciar la producción.',v_proposal.amount,coalesce(v_proposal.currency,'USD')),
    'sent',v_conversation_id);

  return v_project_id;
end;
$function$;

create or replace function app_private.mark_paypal_payment_paid(
  p_payment_plan_id uuid,
  p_order_id text,
  p_capture_id text,
  p_amount numeric,
  p_currency text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_plan public.payment_plans%rowtype;
  v_project public.projects%rowtype;
  v_proposal public.proposals%rowtype;
  v_author_id uuid;
  v_payment_id uuid;
  v_conversation_id uuid;
begin
  if p_payment_plan_id is null or p_order_id is null or p_capture_id is null then
    raise exception 'Payment confirmation parameters are incomplete';
  end if;

  select pp.* into v_plan from public.payment_plans pp where pp.id=p_payment_plan_id for update;
  if not found then raise exception 'Payment plan % not found', p_payment_plan_id; end if;
  if v_plan.provider <> 'paypal' then raise exception 'Payment plan % is not configured for PayPal', p_payment_plan_id; end if;
  if v_plan.provider_order_id is distinct from p_order_id then raise exception 'PayPal order % does not match payment plan %', p_order_id,p_payment_plan_id; end if;
  if round(v_plan.amount::numeric,2) <> round(p_amount::numeric,2) then raise exception 'PayPal amount % does not match payment plan amount %', p_amount,v_plan.amount; end if;
  if upper(v_plan.currency) <> upper(p_currency) then raise exception 'PayPal currency % does not match payment plan currency %', p_currency,v_plan.currency; end if;

  select p.* into v_project from public.projects p where p.id=v_plan.project_id for update;
  if not found then raise exception 'Project % not found for payment plan %', v_plan.project_id,p_payment_plan_id; end if;
  select p.* into v_proposal from public.proposals p where p.id=v_plan.proposal_id for update;
  if not found or v_proposal.status<>'accepted' then raise exception 'Payment plan % is not linked to an accepted proposal',p_payment_plan_id; end if;

  select m.author_id into v_author_id from public.manuscripts m where m.id=v_project.manuscript_id;
  if v_author_id is null then raise exception 'Author not found for project %',v_project.id; end if;

  if v_plan.status='paid' then
    select id into v_payment_id from public.payments where payment_plan_id=p_payment_plan_id and reference=p_capture_id order by created_at desc limit 1;
    if v_payment_id is not null then return v_payment_id; end if;
    select id into v_payment_id from public.payments where payment_plan_id=p_payment_plan_id order by created_at desc limit 1;
    return v_payment_id;
  end if;

  if v_plan.status<>'pending' then raise exception 'Payment plan % is not pending (status=%)',p_payment_plan_id,v_plan.status; end if;

  update public.payment_plans
  set status='paid', provider_capture_id=p_capture_id, paid_at=coalesce(paid_at,now()), updated_at=now()
  where id=p_payment_plan_id;

  insert into public.payments(payment_plan_id,method,reference,amount,paid_at)
  values(p_payment_plan_id,'paypal',p_capture_id,p_amount,now())
  returning id into v_payment_id;

  if v_project.status='planning' then
    update public.projects set status='production', updated_at=now() where id=v_project.id;
  end if;

  if not exists(select 1 from public.timeline where project_id=v_project.id and event='payment_confirmed') then
    insert into public.timeline(project_id,event,details)
    values(v_project.id,'payment_confirmed',format('PayPal payment %s confirmed for payment plan %s.',p_capture_id,p_payment_plan_id));
  end if;

  if not exists(select 1 from public.timeline where project_id=v_project.id and event='production_started') then
    insert into public.timeline(project_id,event,details)
    values(v_project.id,'production_started','Full payment confirmed. Production is authorized to begin.');
  end if;

  select id into v_conversation_id from public.conversations where proposal_id=v_proposal.id limit 1;
  update public.conversations set updated_at=now() where proposal_id=v_proposal.id;

  insert into public.notifications(author_id,title,message,status,conversation_id)
  values(v_author_id,'Pago confirmado — producción iniciada','Hemos confirmado tu pago. Tu obra está oficialmente autorizada para entrar en producción.','sent',v_conversation_id);

  return v_payment_id;
end;
$function$;

create or replace function public.mark_paypal_payment_paid(
  p_payment_plan_id uuid,p_order_id text,p_capture_id text,p_amount numeric,p_currency text
)
returns uuid
language sql
security definer
set search_path = public, app_private
as $function$
  select app_private.mark_paypal_payment_paid(p_payment_plan_id,p_order_id,p_capture_id,p_amount,p_currency);
$function$;

revoke execute on function public.mark_paypal_payment_paid(uuid,text,text,numeric,text) from public, anon, authenticated;
grant execute on function public.mark_paypal_payment_paid(uuid,text,text,numeric,text) to service_role;
grant select on public.payment_plans to authenticated;
grant select on public.payments to authenticated;
grant select on public.invoices to authenticated;

commit;
