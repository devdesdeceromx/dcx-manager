create or replace function public.log_crm_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), case when tg_op = 'INSERT' then 'created' else 'updated' end, lower(tg_table_name), new.id,
    case when tg_op = 'UPDATE' then jsonb_build_object('old_status', old.status, 'new_status', new.status) else '{}'::jsonb end);
  return new;
end;
$$;
create trigger prospects_log_change after insert or update on public.prospects for each row execute function public.log_crm_change();
create trigger clients_log_change after insert or update on public.clients for each row execute function public.log_crm_change();

create or replace function public.convert_prospect_to_client(prospect_uuid uuid)
returns public.clients language plpgsql security definer set search_path = '' as $$
declare source_prospect public.prospects; new_client public.clients;
begin
  if not public.is_active_staff() then raise exception 'No tienes permiso para convertir prospectos'; end if;
  select * into source_prospect from public.prospects where id = prospect_uuid for update;
  if source_prospect.id is null then raise exception 'Prospecto no encontrado'; end if;
  if source_prospect.converted_at is not null then raise exception 'Este prospecto ya fue convertido'; end if;
  insert into public.clients (prospect_id, name, business_name, phone, email, notes, created_by)
  values (source_prospect.id, source_prospect.name, source_prospect.business_name, source_prospect.phone, source_prospect.email, source_prospect.notes, auth.uid()) returning * into new_client;
  update public.prospects set status = 'won', converted_at = now() where id = source_prospect.id;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'converted_to_client', 'prospects', source_prospect.id, jsonb_build_object('client_id', new_client.id));
  return new_client;
end;
$$;
grant execute on function public.convert_prospect_to_client(uuid) to authenticated;
