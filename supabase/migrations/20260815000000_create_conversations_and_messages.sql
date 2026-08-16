-- Migration: 20260815000000_create_conversations_and_messages.sql
-- Description: Creates conversations and messages tables with RLS and indexes for Studio Flamkit Support/Communication.

create extension if not exists pgcrypto;

-- 1. Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  type text not null default 'support' check (type in ('general', 'project', 'editorial', 'proposal', 'support')),
  subject text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('author', 'admin')),
  sender_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- 3. Create performance indexes
create index if not exists idx_conversations_author_id on public.conversations(author_id);
create index if not exists idx_conversations_project_id on public.conversations(project_id);
create index if not exists idx_conversations_status on public.conversations(status);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at);

create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- 4. Enable Row Level Security (RLS)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- 5. RLS Policies for conversations
create policy "Authors can view own conversations"
  on public.conversations for select
  using (auth.uid() = author_id or (select is_admin()));

create policy "Authors can create conversations"
  on public.conversations for insert
  with check (auth.uid() = author_id or (select is_admin()));

create policy "Authors and Admins can update conversations"
  on public.conversations for update
  using (auth.uid() = author_id or (select is_admin()));

-- 6. RLS Policies for messages
create policy "Users can view messages of their conversations"
  on public.messages for select
  using (
    (select is_admin())
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and c.author_id = auth.uid()
    )
  );

create policy "Users can insert messages into their conversations"
  on public.messages for insert
  with check (
    (select is_admin())
    or (
      sender_id = auth.uid()
      and exists (
        select 1 from public.conversations c
        where c.id = messages.conversation_id
        and c.author_id = auth.uid()
      )
    )
  );

create policy "Users can mark messages as read"
  on public.messages for update
  using (
    (select is_admin())
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and c.author_id = auth.uid()
    )
  );
