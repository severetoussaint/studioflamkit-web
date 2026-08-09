create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.projects') is null then
    create table public.projects (
      id uuid primary key default gen_random_uuid()
    );
  end if;

  if to_regclass('public.payments') is null then
    create table public.payments (
      id uuid primary key default gen_random_uuid()
    );
  end if;
end
$$;

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  chapter_number integer not null,
  title text,
  word_count integer not null,
  duration_minutes numeric generated always as (word_count / 155.0) stored,
  pfh_rate_used numeric not null default 400,
  price numeric generated always as (round((word_count / 155.0 / 60.0) * 400, 2)) stored,
  currency text not null default 'USD',
  tier text check (tier in ('entrada', 'intermedio', 'completo')),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'cotizado', 'pagado', 'en_produccion', 'entregado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists chapter_id uuid references public.chapters(id) on delete set null;

create index if not exists idx_chapters_project_id on public.chapters(project_id);
create index if not exists idx_payments_chapter_id on public.payments(chapter_id);
