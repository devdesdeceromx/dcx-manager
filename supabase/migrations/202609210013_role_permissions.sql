create or replace function public.get_my_access()
returns table (role public.app_role, is_active boolean)
language sql stable security definer set search_path = '' as $$
  select profiles.role, profiles.is_active from public.profiles where profiles.id = auth.uid();
$$;
revoke all on function public.get_my_access() from public;
grant execute on function public.get_my_access() to authenticated;

create or replace function public.has_any_role(allowed public.app_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id=auth.uid() and is_active=true and role=any(allowed));
$$;
revoke all on function public.has_any_role(public.app_role[]) from public;
grant execute on function public.has_any_role(public.app_role[]) to authenticated;

create or replace function public.can_access_project(project_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.profiles p where p.id=auth.uid() and p.is_active=true and (
      p.role <> 'collaborator' or exists(select 1 from public.projects pr where pr.id=project_uuid and pr.owner_id=auth.uid())
      or exists(select 1 from public.project_tasks t where t.project_id=project_uuid and t.assignee_id=auth.uid())
    )
  );
$$;

drop policy if exists "Active staff create prospects" on public.prospects;
drop policy if exists "Active staff update prospects" on public.prospects;
create policy "Commercial staff create prospects" on public.prospects for insert to authenticated with check (public.has_any_role(array['administrator','administration']::public.app_role[]) and created_by=auth.uid());
create policy "Commercial staff update prospects" on public.prospects for update to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[])) with check (public.has_any_role(array['administrator','administration']::public.app_role[]));

drop policy if exists "Active staff create clients" on public.clients;
drop policy if exists "Active staff update clients" on public.clients;
create policy "Commercial staff create clients" on public.clients for insert to authenticated with check (public.has_any_role(array['administrator','administration']::public.app_role[]) and created_by=auth.uid());
create policy "Commercial staff update clients" on public.clients for update to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[])) with check (public.has_any_role(array['administrator','administration']::public.app_role[]));

drop policy if exists "Active staff create quotes" on public.quotes;
drop policy if exists "Active staff update quotes" on public.quotes;
drop policy if exists "Active staff create quote items" on public.quote_items;
drop policy if exists "Active staff update quote items" on public.quote_items;
drop policy if exists "Active staff delete quote items" on public.quote_items;
create policy "Commercial staff create quotes" on public.quotes for insert to authenticated with check (public.has_any_role(array['administrator','administration']::public.app_role[]) and created_by=auth.uid());
create policy "Commercial staff update quotes" on public.quotes for update to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[])) with check (public.has_any_role(array['administrator','administration']::public.app_role[]));
create policy "Commercial staff create quote items" on public.quote_items for insert to authenticated with check (public.has_any_role(array['administrator','administration']::public.app_role[]));
create policy "Commercial staff update quote items" on public.quote_items for update to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[])) with check (public.has_any_role(array['administrator','administration']::public.app_role[]));
create policy "Commercial staff delete quote items" on public.quote_items for delete to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[]));

drop policy if exists "Active staff read projects" on public.projects;
drop policy if exists "Active staff create projects" on public.projects;
drop policy if exists "Active staff update projects" on public.projects;
create policy "Role based project read" on public.projects for select to authenticated using (public.can_access_project(id));
create policy "Operations create projects" on public.projects for insert to authenticated with check (public.has_any_role(array['administrator','development']::public.app_role[]) and created_by=auth.uid());
create policy "Operations update projects" on public.projects for update to authenticated using (public.has_any_role(array['administrator','development']::public.app_role[])) with check (public.has_any_role(array['administrator','development']::public.app_role[]));

drop policy if exists "Active staff read project tasks" on public.project_tasks;
drop policy if exists "Active staff create project tasks" on public.project_tasks;
drop policy if exists "Active staff update project tasks" on public.project_tasks;
drop policy if exists "Active staff delete project tasks" on public.project_tasks;
create policy "Role based task read" on public.project_tasks for select to authenticated using (public.has_any_role(array['administrator','development','administration','read_only']::public.app_role[]) or assignee_id=auth.uid());
create policy "Operations create tasks" on public.project_tasks for insert to authenticated with check (public.has_any_role(array['administrator','development']::public.app_role[]) and created_by=auth.uid());
create policy "Operations update tasks" on public.project_tasks for update to authenticated using (public.has_any_role(array['administrator','development']::public.app_role[]) or assignee_id=auth.uid()) with check (public.has_any_role(array['administrator','development']::public.app_role[]) or assignee_id=auth.uid());
create policy "Operations delete tasks" on public.project_tasks for delete to authenticated using (public.has_any_role(array['administrator','development']::public.app_role[]));

drop policy if exists "Active staff read project payments" on public.project_payments;
drop policy if exists "Active staff create project payments" on public.project_payments;
drop policy if exists "Active staff update project payments" on public.project_payments;
create policy "Finance read payments" on public.project_payments for select to authenticated using (public.has_any_role(array['administrator','administration','read_only']::public.app_role[]));
create policy "Finance create payments" on public.project_payments for insert to authenticated with check (public.has_any_role(array['administrator','administration']::public.app_role[]) and created_by=auth.uid());
create policy "Finance update payments" on public.project_payments for update to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[])) with check (public.has_any_role(array['administrator','administration']::public.app_role[]));

drop policy if exists "Active staff read project expenses" on public.project_expenses;
drop policy if exists "Active staff create project expenses" on public.project_expenses;
drop policy if exists "Active staff update project expenses" on public.project_expenses;
create policy "Finance read expenses" on public.project_expenses for select to authenticated using (public.has_any_role(array['administrator','administration','read_only']::public.app_role[]));
create policy "Finance create expenses" on public.project_expenses for insert to authenticated with check (public.has_any_role(array['administrator','administration']::public.app_role[]) and created_by=auth.uid());
create policy "Finance update expenses" on public.project_expenses for update to authenticated using (public.has_any_role(array['administrator','administration']::public.app_role[])) with check (public.has_any_role(array['administrator','administration']::public.app_role[]));

create or replace function public.convert_prospect_to_client(prospect_uuid uuid)
returns public.clients language plpgsql security definer set search_path = '' as $$
declare source_prospect public.prospects; new_client public.clients;
begin
  if not public.has_any_role(array['administrator','administration']::public.app_role[]) then raise exception 'No tienes permiso para convertir prospectos'; end if;
  select * into source_prospect from public.prospects where id=prospect_uuid for update;
  if source_prospect.id is null then raise exception 'Prospecto no encontrado'; end if;
  if source_prospect.converted_at is not null then raise exception 'Este prospecto ya fue convertido'; end if;
  insert into public.clients(prospect_id,name,business_name,phone,email,notes,created_by) values(source_prospect.id,source_prospect.name,source_prospect.business_name,source_prospect.phone,source_prospect.email,source_prospect.notes,auth.uid()) returning * into new_client;
  update public.prospects set status='won',converted_at=now() where id=source_prospect.id;
  insert into public.activity_logs(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'converted_to_client','prospects',source_prospect.id,jsonb_build_object('client_id',new_client.id));
  return new_client;
end; $$;

create or replace function public.accept_quote_and_create_project(quote_uuid uuid)
returns public.projects language plpgsql security definer set search_path = '' as $$
declare source_quote public.quotes; new_project public.projects;
begin
  if not public.has_any_role(array['administrator','administration']::public.app_role[]) then raise exception 'No tienes permiso para aceptar cotizaciones'; end if;
  select * into source_quote from public.quotes where id=quote_uuid for update;
  if source_quote.id is null then raise exception 'Cotización no encontrada'; end if;
  select * into new_project from public.projects where quote_id=source_quote.id;
  if new_project.id is not null then return new_project; end if;
  update public.quotes set status='accepted' where id=source_quote.id;
  insert into public.projects(client_id,quote_id,name,description,price,status,created_by) values(source_quote.client_id,source_quote.id,source_quote.title,source_quote.description,source_quote.total,'waiting_deposit',auth.uid()) returning * into new_project;
  insert into public.activity_logs(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'quote_accepted_project_created','quotes',source_quote.id,jsonb_build_object('project_id',new_project.id));
  return new_project;
end; $$;

create or replace function public.register_project_payment(project_uuid uuid,payment_kind public.payment_kind,payment_amount numeric,payment_method public.payment_method,payment_date date,payment_reference text default null,payment_notes text default null)
returns public.project_payments language plpgsql security definer set search_path = '' as $$
declare source_project public.projects; paid_total numeric; new_payment public.project_payments;
begin
  if not public.has_any_role(array['administrator','administration']::public.app_role[]) then raise exception 'No tienes permiso para registrar pagos'; end if;
  if payment_amount<=0 then raise exception 'El monto debe ser mayor a cero'; end if;
  select * into source_project from public.projects where id=project_uuid for update;
  if source_project.id is null then raise exception 'Proyecto no encontrado'; end if;
  select coalesce(sum(amount),0) into paid_total from public.project_payments where project_id=project_uuid;
  if paid_total+payment_amount>source_project.price then raise exception 'El pago supera el saldo pendiente'; end if;
  insert into public.project_payments(project_id,kind,amount,method,paid_at,reference,notes,created_by) values(project_uuid,payment_kind,payment_amount,payment_method,payment_date,nullif(trim(payment_reference),''),nullif(trim(payment_notes),''),auth.uid()) returning * into new_payment;
  if payment_kind='deposit' and source_project.status='waiting_deposit' then update public.projects set status='ready_to_start' where id=project_uuid; end if;
  return new_payment;
end; $$;

create or replace function public.list_activity_audit()
returns table(id bigint,actor_id uuid,actor_name text,actor_email text,action text,entity_type text,entity_id uuid,metadata jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_administrator() then raise exception 'Solo un administrador puede consultar la auditoría'; end if;
  return query select logs.id,logs.actor_id,profiles.full_name,profiles.email,logs.action,logs.entity_type,logs.entity_id,logs.metadata,logs.created_at from public.activity_logs logs left join public.profiles profiles on profiles.id=logs.actor_id order by logs.created_at desc limit 500;
end; $$;
