alter table public.prospects alter column created_by drop not null;

create or replace function public.submit_website_lead(
  lead_name text,
  lead_business_name text,
  lead_phone text,
  lead_email text,
  lead_service text,
  lead_message text,
  lead_language text,
  website_field text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  clean_name text := trim(coalesce(lead_name, ''));
  clean_email text := nullif(trim(coalesce(lead_email, '')), '');
  clean_phone text := nullif(trim(coalesce(lead_phone, '')), '');
begin
  if nullif(trim(coalesce(website_field, '')), '') is not null then
    raise exception 'Solicitud no válida';
  end if;
  if length(clean_name) < 2 or length(clean_name) > 80 then
    raise exception 'El nombre debe tener entre 2 y 80 caracteres';
  end if;
  if clean_email is null and clean_phone is null then
    raise exception 'Ingresa un correo o teléfono';
  end if;
  if clean_email is not null and (length(clean_email) > 160 or clean_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then
    raise exception 'El correo no es válido';
  end if;
  if clean_phone is not null and length(clean_phone) > 30 then
    raise exception 'El teléfono no es válido';
  end if;
  if length(trim(coalesce(lead_service, ''))) < 2 or length(trim(lead_service)) > 100 then
    raise exception 'Selecciona un servicio válido';
  end if;
  if length(coalesce(lead_business_name, '')) > 120 or length(coalesce(lead_message, '')) > 1500 then
    raise exception 'La información supera el límite permitido';
  end if;
  if lead_language not in ('es', 'en') then
    raise exception 'Idioma no válido';
  end if;

  insert into public.prospects (
    name, business_name, phone, email, service_interest, description,
    source, status, notes, created_by
  ) values (
    clean_name, nullif(trim(coalesce(lead_business_name, '')), ''), clean_phone,
    clean_email, trim(lead_service), nullif(trim(coalesce(lead_message, '')), ''),
    'website', 'new', 'Idioma del sitio: ' || upper(lead_language), null
  ) returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_website_lead(text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_website_lead(text,text,text,text,text,text,text,text) to anon, authenticated;
