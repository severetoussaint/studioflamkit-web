-- Migration: 20260821110000_create_review_lifecycle_rpcs.sql
-- Description: Transactional RPCs for Review lifecycle (create, resolve, discard)
--              integrating atomic timeline events and notification dispatch.

-- Schema app_private functions
create or replace function app_private.create_review(
  p_deliverable_id uuid,
  p_chapter_title text default null,
  p_comment text default '',
  p_file_path text default null
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
begin
  if p_deliverable_id is null then
    raise exception 'Deliverable ID is required';
  end if;

  if p_comment is null or length(trim(p_comment)) = 0 then
    raise exception 'Review comment cannot be empty';
  end if;

  -- Look up project and author
  select d.project_id, p.author_id
  into v_project_id, v_author_id
  from public.deliverables d
  join public.projects p on p.id = d.project_id
  where d.id = p_deliverable_id;

  if v_project_id is null then
    raise exception 'Deliverable % not found or not associated with a project', p_deliverable_id;
  end if;

  -- Authorization check
  if not (public.is_admin() or auth.uid() = v_author_id) then
    raise exception 'Access denied to create review for deliverable %', p_deliverable_id;
  end if;

  -- 1. Insert review
  insert into public.reviews (
    deliverable_id,
    chapter_title,
    comment,
    file_path,
    status
  ) values (
    p_deliverable_id,
    p_chapter_title,
    trim(p_comment),
    p_file_path,
    'open'
  )
  returning id into v_review_id;

  -- 2. Atomic timeline event
  insert into public.timeline (
    project_id,
    event,
    details
  ) values (
    v_project_id,
    'review_created',
    case
      when p_chapter_title is not null and length(trim(p_chapter_title)) > 0
        then 'Nueva observación registrada: ' || trim(p_chapter_title)
      else 'Nueva observación registrada en entregable'
    end
  );

  -- 3. Atomic notification
  if v_author_id is not null then
    insert into public.notifications (
      author_id,
      title,
      message,
      status
    ) values (
      v_author_id,
      'Nueva observación de revisión',
      case
        when p_chapter_title is not null and length(trim(p_chapter_title)) > 0
          then format('Se ha registrado una nota de revisión en "%s".', trim(p_chapter_title))
        else 'Se ha registrado una nueva nota de revisión en el proyecto.'
      end,
      'pending'
    );
  end if;

  return v_review_id;
end;
$$;

create or replace function app_private.resolve_review(
  p_review_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review public.reviews%rowtype;
  v_project_id uuid;
  v_author_id uuid;
begin
  if p_review_id is null then
    raise exception 'Review ID is required';
  end if;

  select r.*, d.project_id, p.author_id
  into v_review, v_project_id, v_author_id
  from public.reviews r
  join public.deliverables d on d.id = r.deliverable_id
  join public.projects p on p.id = d.project_id
  where r.id = p_review_id
  for update;

  if v_review.id is null then
    raise exception 'Review % not found', p_review_id;
  end if;

  -- Authorization check
  if not (public.is_admin() or auth.uid() = v_author_id) then
    raise exception 'Access denied to resolve review %', p_review_id;
  end if;

  -- Idempotency check: if already resolved, return without duplicate events
  if v_review.status = 'resolved' then
    return p_review_id;
  end if;

  -- 1. Update review status
  update public.reviews
  set status = 'resolved'
  where id = p_review_id;

  -- 2. Atomic timeline event
  insert into public.timeline (
    project_id,
    event,
    details
  ) values (
    v_project_id,
    'review_resolved',
    case
      when v_review.chapter_title is not null and length(trim(v_review.chapter_title)) > 0
        then 'Observación resuelta: ' || trim(v_review.chapter_title)
      else 'Observación resuelta en entregable'
    end
  );

  -- 3. Atomic notification
  if v_author_id is not null then
    insert into public.notifications (
      author_id,
      title,
      message,
      status
    ) values (
      v_author_id,
      'Revisión resuelta',
      case
        when v_review.chapter_title is not null and length(trim(v_review.chapter_title)) > 0
          then format('Se ha marcado como resuelta la observación en "%s".', trim(v_review.chapter_title))
        else 'Se ha marcado como resuelta la observación en el entregable.'
      end,
      'pending'
    );
  end if;

  return p_review_id;
end;
$$;

create or replace function app_private.discard_review(
  p_review_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review public.reviews%rowtype;
  v_project_id uuid;
  v_author_id uuid;
begin
  if p_review_id is null then
    raise exception 'Review ID is required';
  end if;

  select r.*, d.project_id, p.author_id
  into v_review, v_project_id, v_author_id
  from public.reviews r
  join public.deliverables d on d.id = r.deliverable_id
  join public.projects p on p.id = d.project_id
  where r.id = p_review_id
  for update;

  if v_review.id is null then
    raise exception 'Review % not found', p_review_id;
  end if;

  -- Authorization check
  if not (public.is_admin() or auth.uid() = v_author_id) then
    raise exception 'Access denied to discard review %', p_review_id;
  end if;

  -- Idempotency check: if already discarded, return without duplicate events
  if v_review.status = 'discarded' then
    return p_review_id;
  end if;

  -- 1. Update review status
  update public.reviews
  set status = 'discarded'
  where id = p_review_id;

  -- 2. Atomic timeline event
  insert into public.timeline (
    project_id,
    event,
    details
  ) values (
    v_project_id,
    'review_discarded',
    case
      when v_review.chapter_title is not null and length(trim(v_review.chapter_title)) > 0
        then 'Observación descartada: ' || trim(v_review.chapter_title)
      else 'Observación descartada en entregable'
    end
  );

  -- 3. Atomic notification
  if v_author_id is not null then
    insert into public.notifications (
      author_id,
      title,
      message,
      status
    ) values (
      v_author_id,
      'Revisión descartada',
      case
        when v_review.chapter_title is not null and length(trim(v_review.chapter_title)) > 0
          then format('Se ha descartado la observación en "%s".', trim(v_review.chapter_title))
        else 'Se ha descartado la observación en el entregable.'
      end,
      'pending'
    );
  end if;

  return p_review_id;
end;
$$;

-- Public wrappers
create or replace function public.create_review(
  p_deliverable_id uuid,
  p_chapter_title text default null,
  p_comment text default '',
  p_file_path text default null
)
returns uuid
language plpgsql
set search_path = public, app_private
as $$
begin
  return app_private.create_review(p_deliverable_id, p_chapter_title, p_comment, p_file_path);
end;
$$;

create or replace function public.resolve_review(
  p_review_id uuid
)
returns uuid
language plpgsql
set search_path = public, app_private
as $$
begin
  return app_private.resolve_review(p_review_id);
end;
$$;

create or replace function public.discard_review(
  p_review_id uuid
)
returns uuid
language plpgsql
set search_path = public, app_private
as $$
begin
  return app_private.discard_review(p_review_id);
end;
$$;

revoke all on function public.create_review(uuid, text, text, text) from public;
grant execute on function public.create_review(uuid, text, text, text) to anon, authenticated, service_role;

revoke all on function public.resolve_review(uuid) from public;
grant execute on function public.resolve_review(uuid) to anon, authenticated, service_role;

revoke all on function public.discard_review(uuid) from public;
grant execute on function public.discard_review(uuid) to anon, authenticated, service_role;
