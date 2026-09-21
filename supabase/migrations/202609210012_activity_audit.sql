create or replace function public.log_crm_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare old_status text; new_status text;
begin
  old_status := case when tg_op = 'UPDATE' then to_jsonb(old) ->> 'status' else null end;
  new_status := to_jsonb(new) ->> 'status';
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), case when tg_op = 'INSERT' then 'created' else 'updated' end, lower(tg_table_name), new.id,
    case when tg_op = 'UPDATE' and old_status is distinct from new_status then jsonb_build_object('old_status', old_status, 'new_status', new_status) else '{}'::jsonb end);
  return new;
end;
$$;

create or replace function public.list_activity_audit()
returns table (id bigint, actor_id uuid, actor_name text, actor_email text, action text, entity_type text, entity_id uuid, metadata jsonb, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_active_staff() then raise exception 'No tienes permiso para consultar la actividad'; end if;
  return query
  select logs.id, logs.actor_id, profiles.full_name, profiles.email, logs.action, logs.entity_type, logs.entity_id, logs.metadata, logs.created_at
  from public.activity_logs as logs
  left join public.profiles as profiles on profiles.id = logs.actor_id
  order by logs.created_at desc limit 500;
end;
$$;
revoke all on function public.list_activity_audit() from public;
grant execute on function public.list_activity_audit() to authenticated;
