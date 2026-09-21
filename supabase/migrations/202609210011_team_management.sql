alter table public.profiles add column if not exists email text;

update public.profiles as profiles
set email = users.email
from auth.users as users
where profiles.id = users.id and profiles.email is null;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

create or replace function public.update_staff_member(target_id uuid, new_role public.app_role, active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_administrator() then raise exception 'Solo un administrador puede gestionar el equipo'; end if;
  if target_id = auth.uid() and (new_role <> 'administrator' or active = false) then
    raise exception 'No puedes retirar tu propio acceso de administrador';
  end if;
  update public.profiles set role = new_role, is_active = active where id = target_id;
  if not found then raise exception 'Usuario no encontrado'; end if;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'staff_updated', 'profile', target_id, jsonb_build_object('role', new_role, 'is_active', active));
end;
$$;

revoke all on function public.update_staff_member(uuid, public.app_role, boolean) from public;
grant execute on function public.update_staff_member(uuid, public.app_role, boolean) to authenticated;

create or replace function public.list_staff_members()
returns table (id uuid, full_name text, email text, role public.app_role, is_active boolean, created_at timestamptz, updated_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_administrator() then raise exception 'Solo un administrador puede consultar el equipo'; end if;
  return query select profiles.id, profiles.full_name, profiles.email, profiles.role, profiles.is_active, profiles.created_at, profiles.updated_at
  from public.profiles order by profiles.created_at;
end;
$$;
revoke all on function public.list_staff_members() from public;
grant execute on function public.list_staff_members() to authenticated;
