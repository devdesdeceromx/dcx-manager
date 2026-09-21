create table public.business_settings (
  id boolean primary key default true check (id = true),
  business_name text not null default 'DevDesdeCeroMX',
  legal_name text, tax_id text, email text, phone text, address text, website text, logo_url text,
  currency text not null default 'MXN' check (char_length(currency) = 3),
  default_tax numeric(5,2) not null default 0 check (default_tax between 0 and 100),
  quote_validity_days integer not null default 15 check (quote_validity_days between 1 and 365),
  quote_terms text, receipt_notes text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.business_settings (id) values (true);
create trigger business_settings_touch_updated_at before update on public.business_settings for each row execute function public.touch_updated_at();
alter table public.business_settings enable row level security;
create policy "Active staff read business settings" on public.business_settings for select to authenticated using (public.is_active_staff());
create policy "Administrators update business settings" on public.business_settings for update to authenticated using (public.is_administrator()) with check (public.is_administrator());
grant select, update on public.business_settings to authenticated;
