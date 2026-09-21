create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare requested_role public.app_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('administrator', 'development', 'administration', 'collaborator', 'read_only')
      then (new.raw_user_meta_data ->> 'role')::public.app_role
    else 'read_only'::public.app_role
  end;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    requested_role
  );
  return new;
end;
$$;

drop function if exists public.list_staff_members();
create function public.list_staff_members()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.app_role,
  is_active boolean,
  invitation_status text,
  invited_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_administrator() then
    raise exception 'Solo un administrador puede consultar el equipo';
  end if;

  return query
  select
    profiles.id,
    profiles.full_name,
    profiles.email,
    profiles.role,
    profiles.is_active,
    case when users.last_sign_in_at is null then 'pending' else 'accepted' end,
    users.invited_at,
    users.last_sign_in_at,
    profiles.created_at,
    profiles.updated_at
  from public.profiles as profiles
  join auth.users as users on users.id = profiles.id
  order by profiles.created_at;
end;
$$;

revoke all on function public.list_staff_members() from public;
grant execute on function public.list_staff_members() to authenticated;
