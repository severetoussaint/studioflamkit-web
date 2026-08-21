-- Tighten Review lifecycle RPC execution privileges.
-- PUBLIC includes anon, so revoking only from anon is insufficient.
revoke all on function public.create_review(uuid, text, text, text) from public;
revoke all on function public.resolve_review(uuid) from public;
revoke all on function public.discard_review(uuid) from public;

grant execute on function public.create_review(uuid, text, text, text) to authenticated, service_role;
grant execute on function public.resolve_review(uuid) to authenticated, service_role;
grant execute on function public.discard_review(uuid) to authenticated, service_role;
