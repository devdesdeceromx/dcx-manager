create type public.project_status as enum ('preparation', 'waiting_deposit', 'ready_to_start', 'development', 'review', 'adjustments', 'ready_delivery', 'delivered', 'warranty', 'closed', 'paused', 'cancelled');
create sequence public.project_folio_seq start 1;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default ('DCX-PRY-' || lpad(nextval('public.project_folio_seq')::text, 4, '0')),
  client_id uuid not null references public.clients(id) on delete restrict,
  quote_id uuid unique references public.quotes(id) on delete set null,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete set null,
  start_date date,
  estimated_delivery date,
  price numeric(12,2) not null default 0 check (price >= 0),
  status public.project_status not null default 'preparation',
  progress smallint not null default 0 check (progress between 0 and 100),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_client_id_idx on public.projects(client_id);
create index projects_status_idx on public.projects(status);
create index projects_owner_id_idx on public.projects(owner_id);
create trigger projects_touch_updated_at before update on public.projects for each row execute function public.touch_updated_at();
create trigger projects_log_change after insert or update on public.projects for each row execute function public.log_crm_change();

alter table public.projects enable row level security;
create policy "Active staff read projects" on public.projects for select to authenticated using (public.is_active_staff());
create policy "Active staff create projects" on public.projects for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update projects" on public.projects for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
grant select, insert, update on public.projects to authenticated;
grant usage, select on sequence public.project_folio_seq to authenticated;

create or replace function public.accept_quote_and_create_project(quote_uuid uuid)
returns public.projects language plpgsql security definer set search_path = '' as $$
declare source_quote public.quotes; new_project public.projects;
begin
  if not public.is_active_staff() then raise exception 'No tienes permiso para aceptar cotizaciones'; end if;
  select * into source_quote from public.quotes where id = quote_uuid for update;
  if source_quote.id is null then raise exception 'Cotización no encontrada'; end if;
  select * into new_project from public.projects where quote_id = source_quote.id;
  if new_project.id is not null then return new_project; end if;
  update public.quotes set status = 'accepted' where id = source_quote.id;
  insert into public.projects (client_id, quote_id, name, description, price, status, created_by)
  values (source_quote.client_id, source_quote.id, source_quote.title, source_quote.description, source_quote.total, 'waiting_deposit', auth.uid())
  returning * into new_project;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'quote_accepted_project_created', 'quotes', source_quote.id, jsonb_build_object('project_id', new_project.id));
  return new_project;
end;
$$;
grant execute on function public.accept_quote_and_create_project(uuid) to authenticated;
