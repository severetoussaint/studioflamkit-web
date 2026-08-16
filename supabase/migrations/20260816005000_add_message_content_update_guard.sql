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
