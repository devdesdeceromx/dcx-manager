create table public.website_settings (
  id boolean primary key default true check (id = true),
  contact_email text not null default 'devdesdeceromx@gmail.com',
  contact_phone text,
  tiktok_url text,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  hero_eyebrow_es text not null default 'Tecnología para negocios de frontera',
  hero_eyebrow_en text not null default 'Technology for border businesses',
  hero_title_es text not null default 'Haz que te encuentren',
  hero_title_en text not null default 'Be found',
  hero_highlight_es text not null default 'antes de cruzar.',
  hero_highlight_en text not null default 'before they cross.',
  hero_description_es text not null default 'Creamos experiencias digitales bilingües para negocios de Nuevo Progreso que reciben clientes de México y Estados Unidos.',
  hero_description_en text not null default 'We build bilingual digital experiences for Nuevo Progreso businesses serving customers from Mexico and the United States.',
  show_services boolean not null default true,
  show_industries boolean not null default true,
  show_process boolean not null default true,
  show_about boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.website_settings (id) values (true);

create trigger website_settings_touch_updated_at
before update on public.website_settings
for each row execute function public.touch_updated_at();

alter table public.website_settings enable row level security;

create policy "Anyone can read website settings"
on public.website_settings for select
to anon, authenticated
using (true);

create policy "Administrators update website settings"
on public.website_settings for update
to authenticated
using (public.is_administrator())
with check (public.is_administrator());

grant select on public.website_settings to anon, authenticated;
grant update on public.website_settings to authenticated;
