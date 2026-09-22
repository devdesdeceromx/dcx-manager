create table public.website_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('page_view','lead')),
  visitor_id uuid not null,
  session_id uuid not null,
  page_path text not null default '/',
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text not null check (device_type in ('desktop','mobile','tablet','other')),
  browser text,
  operating_system text,
  language text,
  timezone text,
  screen_width integer,
  created_at timestamptz not null default now()
);

create index website_events_created_at_idx on public.website_events (created_at desc);
create index website_events_visitor_idx on public.website_events (visitor_id, created_at desc);
alter table public.website_events enable row level security;
create policy "Administrators read website analytics" on public.website_events for select to authenticated using (public.is_administrator());
grant select on public.website_events to authenticated;

create or replace function public.track_website_event(
  p_event_type text, p_visitor_id uuid, p_session_id uuid, p_page_path text default '/',
  p_referrer_host text default null, p_utm_source text default null, p_utm_medium text default null,
  p_utm_campaign text default null, p_device_type text default 'other', p_browser text default null,
  p_operating_system text default null, p_language text default null, p_timezone text default null,
  p_screen_width integer default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_event_type not in ('page_view','lead') then raise exception 'Invalid event'; end if;
  if p_device_type not in ('desktop','mobile','tablet','other') then raise exception 'Invalid device'; end if;
  if length(coalesce(p_page_path,'')) > 300 or length(coalesce(p_referrer_host,'')) > 200 or length(coalesce(p_timezone,'')) > 100 then raise exception 'Invalid payload'; end if;
  if p_event_type = 'page_view' and exists(select 1 from public.website_events where session_id=p_session_id and event_type='page_view' and created_at > now()-interval '30 minutes') then return; end if;
  insert into public.website_events(event_type,visitor_id,session_id,page_path,referrer_host,utm_source,utm_medium,utm_campaign,device_type,browser,operating_system,language,timezone,screen_width)
  values(p_event_type,p_visitor_id,p_session_id,left(coalesce(p_page_path,'/'),300),left(nullif(p_referrer_host,''),200),left(nullif(p_utm_source,''),100),left(nullif(p_utm_medium,''),100),left(nullif(p_utm_campaign,''),150),p_device_type,left(nullif(p_browser,''),80),left(nullif(p_operating_system,''),80),left(nullif(p_language,''),20),left(nullif(p_timezone,''),100),p_screen_width);
end $$;
revoke all on function public.track_website_event(text,uuid,uuid,text,text,text,text,text,text,text,text,text,text,integer) from public;
grant execute on function public.track_website_event(text,uuid,uuid,text,text,text,text,text,text,text,text,text,text,integer) to anon, authenticated;

create or replace function public.get_website_analytics(p_period text default 'month') returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_start timestamptz; v_previous timestamptz; v_bucket text; result jsonb;
begin
  if not public.is_administrator() then raise exception 'Not authorized'; end if;
  v_start := case p_period when 'day' then date_trunc('day',now()) when 'week' then date_trunc('week',now()) when 'year' then date_trunc('year',now()) else date_trunc('month',now()) end;
  v_previous := v_start - (now()-v_start);
  v_bucket := case p_period when 'day' then 'hour' when 'week' then 'day' when 'year' then 'month' else 'day' end;
  with current_events as (select * from public.website_events where created_at>=v_start),
  series as (select date_trunc(v_bucket,created_at) bucket,count(*) filter(where event_type='page_view') views,count(distinct visitor_id) visitors,count(*) filter(where event_type='lead') leads from current_events group by 1 order by 1),
  sources as (select coalesce(utm_source,referrer_host,'Directo') label,count(*) value from current_events where event_type='page_view' group by 1 order by 2 desc limit 8),
  devices as (select device_type label,count(*) value from current_events where event_type='page_view' group by 1 order by 2 desc),
  browsers as (select coalesce(browser,'Otro') label,count(*) value from current_events where event_type='page_view' group by 1 order by 2 desc limit 6),
  languages as (select coalesce(language,'—') label,count(*) value from current_events where event_type='page_view' group by 1 order by 2 desc limit 6)
  select jsonb_build_object('views',(select count(*) from current_events where event_type='page_view'),'visitors',(select count(distinct visitor_id) from current_events where event_type='page_view'),'sessions',(select count(distinct session_id) from current_events where event_type='page_view'),'leads',(select count(*) from current_events where event_type='lead'),'previousViews',(select count(*) from public.website_events where event_type='page_view' and created_at>=v_previous and created_at<v_start),'series',coalesce((select jsonb_agg(to_jsonb(series)) from series),'[]'::jsonb),'sources',coalesce((select jsonb_agg(to_jsonb(sources)) from sources),'[]'::jsonb),'devices',coalesce((select jsonb_agg(to_jsonb(devices)) from devices),'[]'::jsonb),'browsers',coalesce((select jsonb_agg(to_jsonb(browsers)) from browsers),'[]'::jsonb),'languages',coalesce((select jsonb_agg(to_jsonb(languages)) from languages),'[]'::jsonb)) into result;
  return result;
end $$;
revoke all on function public.get_website_analytics(text) from public;
grant execute on function public.get_website_analytics(text) to authenticated;
