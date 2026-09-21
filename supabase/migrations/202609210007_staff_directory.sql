create or replace function public.list_active_staff()
returns table (id uuid, full_name text)
language sql stable security definer set search_path = '' as $$
  select profiles.id, profiles.full_name
  from public.profiles
  where profiles.is_active = true
  order by profiles.full_name;
$$;
revoke all on function public.list_active_staff() from public;
grant execute on function public.list_active_staff() to authenticated;
