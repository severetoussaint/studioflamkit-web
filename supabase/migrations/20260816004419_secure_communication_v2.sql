-- Secure communication v2.
-- Keeps the 1B2 conversations/messages model while hardening updates,
-- adding message idempotency, and linking notifications to conversations.

alter table public.messages
  add column if not exists client_message_id uuid;

alter table public.notifications
  add column if not exists conversation_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notifications'::regclass
      and conname = 'notifications_conversation_id_fkey'
  ) then
    alter table public.notifications
      add constraint notifications_conversation_id_fkey
      foreign key (conversation_id)
      references public.conversations(id)
      on delete cascade;
  end if;
end
$$;

create unique index if not exists idx_messages_client_message_id_unique
  on public.messages(client_message_id)
  where client_message_id is not null;

-- Replace the first implementation's broader update policies.
drop policy if exists "Authors and Admins can update conversations" on public.conversations;
drop policy if exists "Users can mark messages as read" on public.messages;
drop policy if exists "Authors can view own conversations" on public.conversations;
drop policy if exists "Authors can create conversations" on public.conversations;
drop policy if exists "Users can view messages of their conversations" on public.messages;
drop policy if exists "Users can insert messages into their conversations" on public.messages;

create policy "conversations_select_owner_or_admin"
  on public.conversations for select
  to authenticated
  using (auth.uid() = author_id or (select public.is_admin()));

create policy "conversations_insert_owner_or_admin"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = author_id or (select public.is_admin()));

create policy "conversations_update_admin_only"
  on public.conversations for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "messages_select_owner_or_admin"
  on public.messages for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.author_id = auth.uid()
    )
  );

create policy "messages_insert_owner_or_admin"
  on public.messages for insert
  to authenticated
  with check (
    (select public.is_admin())
    or (
      sender_id = auth.uid()
      and exists (
        select 1
        from public.conversations c
        where c.id = messages.conversation_id
          and c.author_id = auth.uid()
      )
    )
  );

create policy "messages_update_read_or_admin"
  on public.messages for update
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.author_id = auth.uid()
    )
  )
  with check (
    (select public.is_admin())
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.author_id = auth.uid()
    )
  );

-- Non-admin users may only change read_at on messages in their conversations.
create or replace function public.prevent_message_content_updates()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $$
begin
  if not (select public.is_admin()) then
    new.conversation_id := old.conversation_id;
    new.client_message_id := old.client_message_id;
    new.sender_type := old.sender_type;
    new.sender_id := old.sender_id;
    new.body := old.body;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists messages_restrict_non_read_updates on public.messages;
create trigger messages_restrict_non_read_updates
before update on public.messages
for each row
execute function public.prevent_message_content_updates();
