alter table public.project_briefs
  add column if not exists social_profiles jsonb not null default '[]'::jsonb;

alter table public.project_briefs
  add constraint project_briefs_social_profiles_array_check
  check (jsonb_typeof(social_profiles) = 'array');
