create table if not exists public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null unique references public.manuscripts(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  genre text,
  target_audience text,
  creative_vision text,
  desired_sensations text[] not null default '{}',
  production_preferences text,
  creative_references text,
  must_avoid text,
  desired_delivery_format text,
  technical_preferences text,
  target_date date,
  additional_notes text,
  creator_status text not null default 'none' check (creator_status in ('creator','social_presence','none')),
  social_platforms text[] not null default '{}',
  creator_content_type text,
  audience_size_band text check (audience_size_band in ('0','1_999','1k_9_9k','10k_49_9k','50k_249_9k','250k_999_9k','1m_plus')),
  primary_social_url text,
  project_goal text,
  distribution_platforms text[] not null default '{}',
  promotion_platforms text[] not null default '{}',
  rights_status text not null default 'unknown' check (rights_status in ('confirmed','unsure','needs_guidance')),
  budget_band text,
  future_distribution_interest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_briefs_author_id on public.project_briefs(author_id);

alter table public.project_briefs enable row level security;

drop policy if exists project_briefs_author_select on public.project_briefs;
drop policy if exists project_briefs_author_insert on public.project_briefs;
drop policy if exists project_briefs_author_update on public.project_briefs;

create policy project_briefs_author_select on public.project_briefs
  for select to authenticated
  using (author_id = auth.uid() or (select is_admin()));

create policy project_briefs_author_insert on public.project_briefs
  for insert to authenticated
  with check (author_id = auth.uid() or (select is_admin()));

create policy project_briefs_author_update on public.project_briefs
  for update to authenticated
  using (author_id = auth.uid() or (select is_admin()))
  with check (author_id = auth.uid() or (select is_admin()));

grant select, insert, update on public.project_briefs to authenticated;
