create or replace function public.update_my_profile(new_full_name text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Sesión no válida';
  end if;
  if length(trim(new_full_name)) < 2 or length(trim(new_full_name)) > 80 then
    raise exception 'El nombre debe tener entre 2 y 80 caracteres';
  end if;

  update public.profiles
  set full_name = trim(new_full_name)
  where id = auth.uid() and is_active = true
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'No fue posible actualizar el perfil';
  end if;

  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'profile_updated', 'profile', auth.uid(), jsonb_build_object('full_name', updated_profile.full_name));

  return updated_profile;
end;
$$;

revoke all on function public.update_my_profile(text) from public, anon;
grant execute on function public.update_my_profile(text) to authenticated;
