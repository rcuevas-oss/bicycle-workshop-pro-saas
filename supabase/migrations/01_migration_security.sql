-- Migración de Seguridad y Multi-Tenencia (Auth + RLS)

-- 1. TABLA PERFILES (Vínculo Auth - Negocio)
create table if not exists perfiles (
  id uuid references auth.users(id) on delete cascade primary key,
  negocio_id uuid references negocios(id),
  rol text not null check (rol in ('superadmin', 'admin', 'mecanico')),
  nombre text,
  email text,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FUNCIÓN HELPER: Obtener Negocio ID del usuario actual
create or replace function get_my_business_id()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  bid uuid;
begin
  select negocio_id into bid
  from perfiles
  where id = auth.uid()
  limit 1;
  
  return bid;
end;
$$;

-- 3. TRIGGER: ONBOARDING AUTOMÁTICO
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_business_id uuid;
begin
  -- Crear un nuevo Negocio para este usuario
  insert into public.negocios (nombre)
  values ('Taller de ' || new.email)
  returning id into new_business_id;

  -- Crear el Perfil de Admin vinculado a ese negocio
  insert into public.perfiles (id, negocio_id, rol, email, nombre)
  values (new.id, new_business_id, 'admin', new.email, split_part(new.email, '@', 1));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. HABILITAR RLS
alter table negocios enable row level security;
alter table perfiles enable row level security;
alter table clientes enable row level security;
alter table bicicletas enable row level security;
alter table inventario enable row level security;
alter table movimientos_inventario enable row level security;
alter table servicios_catalogo enable row level security;
alter table recetas_apu enable row level security;
alter table ordenes_trabajo enable row level security;
alter table ot_detalles enable row level security;
alter table comisiones enable row level security;
alter table mecanicos enable row level security;

-- 5. POLÍTICAS DE SEGURIDAD

-- NEGOCIOS
create policy "Ver propio negocio" on negocios
  for select using (id = get_my_business_id());

create policy "Actualizar propio negocio" on negocios
  for update using (id = get_my_business_id());

-- PERFILES
create policy "Ver propio perfil" on perfiles
  for all using (auth.uid() = id);

create policy "Ver perfiles del mismo negocio" on perfiles
  for select using (negocio_id = get_my_business_id());

-- DATOS (Tenant Isolation)
create policy "Tenant Isolation Clientes" on clientes for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Bicicletas" on bicicletas for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Inventario" on inventario for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Movimientos" on movimientos_inventario for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Servicios" on servicios_catalogo for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Recetas" on recetas_apu for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Ordenes" on ordenes_trabajo for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Detalles" on ot_detalles for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Comisiones" on comisiones for all using (business_id = get_my_business_id());
create policy "Tenant Isolation Mecanicos" on mecanicos for all using (business_id = get_my_business_id());
