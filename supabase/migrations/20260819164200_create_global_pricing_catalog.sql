create table if not exists public.pricing_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  numeric_value numeric,
  text_value text,
  json_value jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.pricing_services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  category text not null,
  name text not null,
  description text,
  pricing_model text not null check (pricing_model in ('included','percent_of_base','fixed','per_unit','per_finished_hour','per_minute','per_chapter','per_actor')),
  price_value numeric not null default 0 check (price_value >= 0),
  time_minutes numeric not null default 0 check (time_minutes >= 0),
  unit_label text,
  default_quantity numeric not null default 1 check (default_quantity >= 0),
  min_quantity numeric not null default 1 check (min_quantity >= 0),
  max_quantity numeric,
  included_by_default boolean not null default false,
  active boolean not null default true,
  customer_visible boolean not null default true,
  sort_order integer not null default 0,
  dependencies jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint pricing_services_quantity_bounds check (max_quantity is null or max_quantity >= min_quantity)
);

create index if not exists pricing_services_active_sort_idx
  on public.pricing_services (active, sort_order, category);

create index if not exists pricing_services_code_idx
  on public.pricing_services (code);

create index if not exists pricing_settings_key_idx
  on public.pricing_settings (key);

alter table public.pricing_settings enable row level security;
alter table public.pricing_services enable row level security;

create policy pricing_settings_admin_select
  on public.pricing_settings for select to authenticated using (is_admin());
create policy pricing_settings_admin_insert
  on public.pricing_settings for insert to authenticated with check (is_admin());
create policy pricing_settings_admin_update
  on public.pricing_settings for update to authenticated using (is_admin()) with check (is_admin());
create policy pricing_settings_admin_delete
  on public.pricing_settings for delete to authenticated using (is_admin());

create policy pricing_services_admin_select
  on public.pricing_services for select to authenticated using (is_admin());
create policy pricing_services_admin_insert
  on public.pricing_services for insert to authenticated with check (is_admin());
create policy pricing_services_admin_update
  on public.pricing_services for update to authenticated using (is_admin()) with check (is_admin());
create policy pricing_services_admin_delete
  on public.pricing_services for delete to authenticated using (is_admin());

insert into public.pricing_settings (key, numeric_value, text_value, json_value, description)
values
  ('base_pfh_rate_usd', 400, null, null, 'Tarifa base por hora de audio terminado.'),
  ('words_per_minute', 155, null, null, 'Velocidad base usada para estimar duración de audio.'),
  ('minimum_base_price_usd', 30, null, null, 'Precio mínimo para evitar cotizaciones irrisorias.'),
  ('base_work_hours_per_audio_hour', 4, null, null, 'Horas internas estimadas por cada hora de audio terminado.'),
  ('max_total_price_multiplier', 1.85, null, null, 'Techo de protección del precio calculado respecto al precio base.'),
  ('complexity_multipliers', null, null, '{"standard":1.0,"medium":1.05,"high":1.12,"cinematic":1.20}'::jsonb, 'Multiplicadores globales de complejidad de producción.'),
  ('recommended_adjustment_bounds', null, null, '{"min":-0.20,"max":0.20}'::jsonb, 'Rango recomendado de ajuste comercial sobre el precio calculado.'),
  ('pricing_model_version', 1, 'v1', null, 'Versión del motor global de precios.'),
  ('service_catalog_version', 1, 'v1', null, 'Versión del catálogo global de servicios.')
on conflict (key) do update set
  numeric_value = excluded.numeric_value,
  text_value = excluded.text_value,
  json_value = excluded.json_value,
  description = excluded.description,
  updated_at = now();

insert into public.pricing_services (code, category, name, description, pricing_model, price_value, time_minutes, unit_label, included_by_default, customer_visible, sort_order)
values
  ('dialogue_editing_standard', 'dialogue', 'Edición de diálogo estándar', 'Edición base contemplada dentro de la producción estándar.', 'included', 0, 0, 'proyecto', true, true, 10),
  ('mastering_standard', 'mastering', 'Mastering estándar', 'Master final dentro de la producción estándar.', 'included', 0, 0, 'proyecto', true, true, 20),
  ('sound_design', 'sound_design', 'Diseño sonoro', 'Creación y organización de la identidad sonora del proyecto.', 'percent_of_base', 0.15, 60, 'proyecto', false, true, 100),
  ('foley', 'sound_design', 'Foley', 'Creación y edición de efectos de Foley sincronizados.', 'percent_of_base', 0.12, 45, 'proyecto', false, true, 110),
  ('custom_sfx', 'sound_design', 'SFX personalizados', 'Diseño o edición de efectos personalizados fuera de librería estándar.', 'percent_of_base', 0.10, 40, 'proyecto', false, true, 120),
  ('field_recording', 'sound_design', 'Field Recording', 'Grabación de ambientes o efectos propios para el proyecto.', 'percent_of_base', 0.08, 60, 'sesión', false, true, 130),
  ('original_music', 'music', 'Música original', 'Composición o producción de música original para la obra.', 'percent_of_base', 0.15, 90, 'pieza', false, true, 200),
  ('additional_actor', 'voice', 'Actor adicional', 'Participación adicional de voz/actor más allá del alcance base.', 'percent_of_base', 0.15, 120, 'actor', false, true, 300),
  ('advanced_restoration', 'dialogue', 'Restauración avanzada', 'Reducción de ruido, reparación y recuperación de grabaciones problemáticas.', 'percent_of_base', 0.12, 60, 'hora de audio', false, true, 320),
  ('binaural_mix', 'mixing', 'Mezcla binaural', 'Mezcla preparada específicamente para escucha binaural.', 'percent_of_base', 0.10, 45, 'proyecto', false, true, 400),
  ('surround_mix', 'mixing', 'Mezcla surround', 'Mezcla multicanal distinta del estéreo estándar.', 'percent_of_base', 0.18, 75, 'proyecto', false, true, 410),
  ('atmos_mix', 'mixing', 'Mezcla Dolby Atmos', 'Mezcla inmersiva para entregables compatibles con Atmos.', 'percent_of_base', 0.25, 120, 'proyecto', false, true, 420),
  ('qc_delivery', 'delivery', 'QC y entrega técnica', 'Control de calidad y preparación técnica de entregables.', 'percent_of_base', 0.05, 30, 'proyecto', false, true, 500)
on conflict (code) do update set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  pricing_model = excluded.pricing_model,
  price_value = excluded.price_value,
  time_minutes = excluded.time_minutes,
  unit_label = excluded.unit_label,
  included_by_default = excluded.included_by_default,
  customer_visible = excluded.customer_visible,
  sort_order = excluded.sort_order,
  updated_at = now();