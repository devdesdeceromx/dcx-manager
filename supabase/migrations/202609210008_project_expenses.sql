create type public.expense_category as enum ('tools', 'hosting', 'licenses', 'collaborators', 'advertising', 'taxes', 'other');

create or replace function public.is_administrator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and role = 'administrator'
  );
$$;
revoke all on function public.is_administrator() from public;
grant execute on function public.is_administrator() to authenticated;

create table public.project_expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  category public.expense_category not null,
  description text not null check (char_length(trim(description)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  vendor text,
  expense_date date not null default current_date,
  reference text,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_expenses_project_id_idx on public.project_expenses(project_id);
create index project_expenses_date_idx on public.project_expenses(expense_date desc);
create index project_expenses_category_idx on public.project_expenses(category);
create trigger project_expenses_touch_updated_at before update on public.project_expenses for each row execute function public.touch_updated_at();
create trigger project_expenses_log_change after insert or update on public.project_expenses for each row execute function public.log_crm_change();

alter table public.project_expenses enable row level security;
create policy "Active staff read project expenses" on public.project_expenses for select to authenticated using (public.is_active_staff());
create policy "Active staff create project expenses" on public.project_expenses for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update project expenses" on public.project_expenses for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "Administrators delete project expenses" on public.project_expenses for delete to authenticated using (public.is_administrator());
grant select, insert, update, delete on public.project_expenses to authenticated;
