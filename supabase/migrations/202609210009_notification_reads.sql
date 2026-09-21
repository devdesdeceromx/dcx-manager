create table public.notification_reads (
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_key text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_key)
);

alter table public.notification_reads enable row level security;
create policy "Users read their notification state" on public.notification_reads for select to authenticated using (user_id = auth.uid());
create policy "Users create their notification state" on public.notification_reads for insert to authenticated with check (user_id = auth.uid());
create policy "Users update their notification state" on public.notification_reads for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.notification_reads to authenticated;
