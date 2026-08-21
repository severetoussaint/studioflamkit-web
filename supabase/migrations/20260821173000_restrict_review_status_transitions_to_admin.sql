-- Restrict Review status transitions to Studio FLAMKIT staff.
-- The frontend author may create a Review, but only Admin/staff may resolve or discard it.

create or replace function app_private.update_review_status_with_activity(
  p_review_id uuid,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_author_id uuid;
  v_current_status text;
  v_is_admin boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_status not in ('resolved', 'discarded') then
    raise exception 'Invalid review transition status: %', p_status;
  end if;

  select d.project_id, p.author_id, r.status
    into v_project_id, v_author_id, v_current_status
  from public.reviews r
  join public.deliverables d on d.id = r.deliverable_id
  join public.projects p on p.id = d.project_id
  where r.id = p_review_id;

  if v_project_id is null or v_author_id is null then
    raise exception 'Review or owning project not found';
  end if;

  v_is_admin := public.is_admin();

  if not v_is_admin then
    raise exception 'Only Studio FLAMKIT staff can change a review status';
  end if;

  if v_current_status <> 'open' then
    raise exception 'Review % is already %', p_review_id, v_current_status;
  end if;

  update public.reviews
  set status = p_status
  where id = p_review_id
    and status = 'open';

  if not found then
    raise exception 'Review % could not be transitioned', p_review_id;
  end if;

  insert into public.timeline(project_id, event, details)
  values (
    v_project_id,
    case when p_status = 'resolved' then 'review_resolved' else 'review_discarded' end,
    case when p_status = 'resolved' then 'Feedback editorial resuelto' else 'Feedback editorial descartado' end
  );

  insert into public.notifications(author_id, title, message, status)
  values (
    v_author_id,
    case when p_status = 'resolved' then 'Feedback actualizado' else 'Feedback descartado' end,
    case when p_status = 'resolved' then 'El equipo editorial ha marcado una observación como resuelta.' else 'El equipo editorial ha descartado una observación.' end,
    'sent'
  );

  return p_review_id;
end;
$$;
