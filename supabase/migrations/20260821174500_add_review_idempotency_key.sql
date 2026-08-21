-- Add an explicit idempotency key to Review creation so retries/double-clicks
-- cannot create duplicate Review + Timeline + Notification records.

alter table public.reviews
  add column if not exists idempotency_key uuid;

create unique index if not exists reviews_idempotency_key_uidx
  on public.reviews (idempotency_key)
  where idempotency_key is not null;

create or replace function app_private.create_review_with_activity(
  p_deliverable_id uuid,
  p_chapter_title text,
  p_comment text,
  p_file_path text,
  p_idempotency_key uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_author_id uuid;
  v_review_id uuid;
  v_is_admin boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(p_comment), '') = '' then
    raise exception 'Review comment is required';
  end if;

  select d.project_id, p.author_id
    into v_project_id, v_author_id
  from public.deliverables d
  join public.projects p on p.id = d.project_id
  where d.id = p_deliverable_id;

  if v_project_id is null or v_author_id is null then
    raise exception 'Deliverable or owning project not found';
  end if;

  v_is_admin := public.is_admin();

  if not v_is_admin and v_author_id <> auth.uid() then
    raise exception 'Not authorized to create review for deliverable %', p_deliverable_id;
  end if;

  if p_idempotency_key is not null then
    select r.id into v_review_id
    from public.reviews r
    where r.idempotency_key = p_idempotency_key
    limit 1;

    if v_review_id is not null then
      return v_review_id;
    end if;
  end if;

  insert into public.reviews(
    deliverable_id,
    chapter_title,
    comment,
    file_path,
    status,
    idempotency_key
  )
  values (
    p_deliverable_id,
    p_chapter_title,
    trim(p_comment),
    p_file_path,
    'open',
    p_idempotency_key
  )
  returning id into v_review_id;

  insert into public.timeline(project_id, event, details)
  values (
    v_project_id,
    'review_created',
    coalesce(p_chapter_title, 'Nuevo feedback editorial')
  );

  if v_is_admin then
    insert into public.notifications(author_id, title, message, status)
    values (
      v_author_id,
      'Nuevo feedback editorial',
      case
        when p_chapter_title is null or trim(p_chapter_title) = '' then 'El equipo editorial ha añadido una nueva observación a tu obra.'
        else format('El equipo editorial ha añadido una nueva observación: %s.', p_chapter_title)
      end,
      'sent'
    );
  end if;

  return v_review_id;
exception
  when unique_violation then
    if p_idempotency_key is not null then
      select r.id into v_review_id
      from public.reviews r
      where r.idempotency_key = p_idempotency_key
      limit 1;
      if v_review_id is not null then
        return v_review_id;
      end if;
    end if;
    raise;
end;
$$;

create or replace function public.create_review(
  p_deliverable_id uuid,
  p_chapter_title text default null,
  p_comment text default '',
  p_file_path text default null,
  p_idempotency_key uuid default null
)
returns uuid
language sql
set search_path = public, app_private
as $$
  select app_private.create_review_with_activity(
    p_deliverable_id,
    p_chapter_title,
    p_comment,
    p_file_path,
    p_idempotency_key
  );
$$;

revoke all on function public.create_review(uuid, text, text, text, uuid) from public;
grant execute on function public.create_review(uuid, text, text, text, uuid) to authenticated, service_role;
