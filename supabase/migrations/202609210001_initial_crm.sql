-- DCX-SYS-02: núcleo inicial del CRM de DevDesdeCeroMX.
create extension if not exists pgcrypto;

create type public.app_role as enum ('administrator', 'development', 'administration', 'collaborator', 'read_only');
create type public.prospect_status as enum ('new', 'contacted', 'qualified', 'quote', 'negotiation', 'won', 'lost');
create type public.prospect_source as enum ('referral', 'facebook', 'tiktok', 'website', 'whatsapp', 'existing_client', 'direct_contact', 'other');
create type public.client_status as enum ('active', 'inactive');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'read_only',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence public.prospect_folio_seq start 1;
create sequence public.client_folio_seq start 1;

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default ('DCX-PROSP-' || lpad(nextval('public.prospect_folio_seq')::text, 4, '0')),
  name text not null,
  business_name text,
  phone text,
  email text,
  service_interest text not null,
  description text,
  source public.prospect_source not null default 'other',
  estimated_budget numeric(12,2) check (estimated_budget is null or estimated_budget >= 0),
  owner_id uuid references public.profiles(id) on delete set null,
  status public.prospect_status not null default 'new',
  lost_reason text,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_at timestamptz
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default ('DCX-CLI-' || lpad(nextval('public.client_folio_seq')::text, 4, '0')),
  prospect_id uuid unique references public.prospects(id) on delete set null,
  name text not null,
  business_name text,
  phone text,
  email text,
  address text,
  notes text,
  status public.client_status not null default 'active',
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index prospects_status_idx on public.prospects(status);
create index prospects_owner_id_idx on public.prospects(owner_id);
create index prospects_created_at_idx on public.prospects(created_at desc);
create index clients_status_idx on public.clients(status);
create index activity_logs_entity_idx on public.activity_logs(entity_type, entity_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger prospects_touch_updated_at before update on public.prospects for each row execute function public.touch_updated_at();
create trigger clients_touch_updated_at before update on public.clients for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)), 'administrator'
from auth.users
on conflict (id) do update set role = 'administrator';

create or replace function public.is_active_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function public.is_administrator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and role = 'administrator'
  );
$$;

alter table public.profiles enable row level security;
alter table public.prospects enable row level security;
alter table public.clients enable row level security;
alter table public.activity_logs enable row level security;

create policy "Users can read their profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Administrators manage profiles" on public.profiles for all to authenticated
  using (public.is_administrator())
  with check (public.is_administrator());
create policy "Active staff read prospects" on public.prospects for select to authenticated using (public.is_active_staff());
create policy "Active staff create prospects" on public.prospects for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update prospects" on public.prospects for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "Active staff read clients" on public.clients for select to authenticated using (public.is_active_staff());
create policy "Active staff create clients" on public.clients for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update clients" on public.clients for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "Active staff read activity" on public.activity_logs for select to authenticated using (public.is_active_staff());
create policy "Active staff create activity" on public.activity_logs for insert to authenticated with check (public.is_active_staff() and actor_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update on public.prospects, public.clients to authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant usage, select on sequence public.prospect_folio_seq, public.client_folio_seq to authenticated;
