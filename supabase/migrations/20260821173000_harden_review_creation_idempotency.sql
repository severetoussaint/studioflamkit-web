-- Harden Review creation against accidental duplicate submissions.
-- Keep Timeline/Notification writes inside the same transaction.
-- Also remove anonymous execution from Review lifecycle RPCs.

create or replace function app_private.create_review_with_activity(
  p_deliverable_id uuid,
  p_chapter_title text,
  p_comment text,
  p_file_path text
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

  -- Prevent accidental duplicate creation during double-click/retry while an identical open review exists.
  -- This is scoped to OPEN reviews so the same comment can be submitted again later after resolution/discard.
  select r.id
    into v_review_id
  from public.reviews r
  where r.deliverable_id = p_deliverable_id
    and r.status = 'open'
    and trim(r.comment) = trim(p_comment)
    and coalesce(r.chapter_title, '') = coalesce(p_chapter_title, '')
    and coalesce(r.file_path, '') = coalesce(p_file_path, '')
  order by r.created_at desc
  limit 1;

  if v_review_id is not null then
    return v_review_id;
  end if;

  insert into public.reviews(deliverable_id, chapter_title, comment, file_path, status)
  values (p_deliverable_id, p_chapter_title, p_comment, p_file_path, 'open')
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
end;
$$;

revoke all on function public.create_review(uuid, text, text, text) from anon;
revoke all on function public.resolve_review(uuid) from anon;
revoke all on function public.discard_review(uuid) from anon;

grant execute on function public.create_review(uuid, text, text, text) to authenticated, service_role;
grant execute on function public.resolve_review(uuid) to authenticated, service_role;
grant execute on function public.discard_review(uuid) to authenticated, service_role;
