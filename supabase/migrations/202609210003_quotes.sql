create type public.quote_status as enum ('draft', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected', 'expired');
create sequence public.quote_folio_seq start 1;

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default ('DCX-COT-' || lpad(nextval('public.quote_folio_seq')::text, 4, '0')),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  description text,
  status public.quote_status not null default 'draft',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  valid_until date,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index quotes_client_id_idx on public.quotes(client_id);
create index quotes_status_idx on public.quotes(status);
create index quotes_created_at_idx on public.quotes(created_at desc);
create index quote_items_quote_id_idx on public.quote_items(quote_id);
create trigger quotes_touch_updated_at before update on public.quotes for each row execute function public.touch_updated_at();
create trigger quotes_log_change after insert or update on public.quotes for each row execute function public.log_crm_change();

create or replace function public.recalculate_quote(quote_uuid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.quotes
  set subtotal = coalesce((select sum(quantity * unit_price) from public.quote_items where quote_id = quote_uuid), 0),
      total = greatest(coalesce((select sum(quantity * unit_price) from public.quote_items where quote_id = quote_uuid), 0) - discount + tax, 0)
  where id = quote_uuid;
end;
$$;

create or replace function public.quote_items_recalculate()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.recalculate_quote(coalesce(new.quote_id, old.quote_id));
  return coalesce(new, old);
end;
$$;

create trigger quote_items_recalculate_total after insert or update or delete on public.quote_items for each row execute function public.quote_items_recalculate();

alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
create policy "Active staff read quotes" on public.quotes for select to authenticated using (public.is_active_staff());
create policy "Active staff create quotes" on public.quotes for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update quotes" on public.quotes for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "Active staff read quote items" on public.quote_items for select to authenticated using (public.is_active_staff());
create policy "Active staff create quote items" on public.quote_items for insert to authenticated with check (public.is_active_staff());
create policy "Active staff update quote items" on public.quote_items for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "Active staff delete quote items" on public.quote_items for delete to authenticated using (public.is_active_staff());
grant select, insert, update on public.quotes to authenticated;
grant select, insert, update, delete on public.quote_items to authenticated;
grant usage, select on sequence public.quote_folio_seq to authenticated;
