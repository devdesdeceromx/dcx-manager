create type public.payment_kind as enum ('deposit', 'partial', 'final');
create type public.payment_method as enum ('transfer', 'cash', 'card', 'other');

create table public.project_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  kind public.payment_kind not null,
  amount numeric(12,2) not null check (amount > 0),
  method public.payment_method not null,
  paid_at date not null default current_date,
  reference text,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

create index project_payments_project_id_idx on public.project_payments(project_id);
create index project_payments_paid_at_idx on public.project_payments(paid_at desc);
create trigger project_payments_log_change after insert or update on public.project_payments for each row execute function public.log_crm_change();
alter table public.project_payments enable row level security;
create policy "Active staff read project payments" on public.project_payments for select to authenticated using (public.is_active_staff());
create policy "Active staff create project payments" on public.project_payments for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update project payments" on public.project_payments for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
grant select, insert, update on public.project_payments to authenticated;

create or replace function public.register_project_payment(project_uuid uuid, payment_kind public.payment_kind, payment_amount numeric, payment_method public.payment_method, payment_date date, payment_reference text default null, payment_notes text default null)
returns public.project_payments language plpgsql security definer set search_path = '' as $$
declare source_project public.projects; paid_total numeric; new_payment public.project_payments;
begin
  if not public.is_active_staff() then raise exception 'No tienes permiso para registrar pagos'; end if;
  if payment_amount <= 0 then raise exception 'El monto debe ser mayor a cero'; end if;
  select * into source_project from public.projects where id = project_uuid for update;
  if source_project.id is null then raise exception 'Proyecto no encontrado'; end if;
  select coalesce(sum(amount), 0) into paid_total from public.project_payments where project_id = project_uuid;
  if paid_total + payment_amount > source_project.price then raise exception 'El pago supera el saldo pendiente'; end if;
  insert into public.project_payments (project_id, kind, amount, method, paid_at, reference, notes, created_by)
  values (project_uuid, payment_kind, payment_amount, payment_method, payment_date, nullif(trim(payment_reference), ''), nullif(trim(payment_notes), ''), auth.uid()) returning * into new_payment;
  if payment_kind = 'deposit' and source_project.status = 'waiting_deposit' then update public.projects set status = 'ready_to_start' where id = project_uuid; end if;
  return new_payment;
end;
$$;
grant execute on function public.register_project_payment(uuid, public.payment_kind, numeric, public.payment_method, date, text, text) to authenticated;
