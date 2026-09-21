create type public.task_status as enum ('todo', 'in_progress', 'review', 'completed', 'blocked');
create type public.task_priority as enum ('low', 'medium', 'high');

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  deliverable_url text,
  deliverable_notes text,
  sort_order integer not null default 0,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_tasks_project_id_idx on public.project_tasks(project_id);
create index project_tasks_assignee_id_idx on public.project_tasks(assignee_id);
create index project_tasks_due_date_idx on public.project_tasks(due_date);
create trigger project_tasks_touch_updated_at before update on public.project_tasks for each row execute function public.touch_updated_at();
create trigger project_tasks_log_change after insert or update on public.project_tasks for each row execute function public.log_crm_change();

create or replace function public.recalculate_project_progress(project_uuid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.projects
  set progress = coalesce((select round(100.0 * count(*) filter (where status = 'completed') / nullif(count(*), 0)) from public.project_tasks where project_id = project_uuid), 0)
  where id = project_uuid;
end;
$$;

create or replace function public.project_tasks_recalculate_progress()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.recalculate_project_progress(coalesce(new.project_id, old.project_id));
  return coalesce(new, old);
end;
$$;
create trigger project_tasks_recalculate_progress after insert or update or delete on public.project_tasks for each row execute function public.project_tasks_recalculate_progress();

alter table public.project_tasks enable row level security;
create policy "Active staff read project tasks" on public.project_tasks for select to authenticated using (public.is_active_staff());
create policy "Active staff create project tasks" on public.project_tasks for insert to authenticated with check (public.is_active_staff() and created_by = auth.uid());
create policy "Active staff update project tasks" on public.project_tasks for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "Active staff delete project tasks" on public.project_tasks for delete to authenticated using (public.is_active_staff());
grant select, insert, update, delete on public.project_tasks to authenticated;
