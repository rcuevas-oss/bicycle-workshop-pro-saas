-- Migración V2 (Definitiva): Sistema Taller Multi-Tenencia (SaaS-Ready)

-- Habilitar extensión UUID si no existe
create extension if not exists "uuid-ossp";

-- 0. TALLERES (Tenants)
create table if not exists negocios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Creamos el "Taller Default" para compatibilidad.
insert into negocios (id, nombre) values ('00000000-0000-0000-0000-000000000000', 'Mi Taller Principal') on conflict do nothing;

-- 0.5 MECANICOS (Recurso Humano)
create table if not exists mecanicos (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  nombre text not null,
  especialidad text,
  activo boolean default true,
  usuario_id uuid references auth.users(id),
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1. CLIENTES
create table if not exists clientes (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  nombre text not null,
  telefono text,
  email text,
  direccion text,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. BICICLETAS (El Activo con Trazabilidad)
create table if not exists bicicletas (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  cliente_id uuid references clientes(id) on delete cascade not null,
  marca text not null,
  modelo text not null,
  color text,
  serial text,
  anio text,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INVENTARIO (Productos, Insumos y Repuestos)
create table if not exists inventario (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  nombre text not null,
  sku text,
  tipo text not null check (tipo in ('repuesto', 'insumo', 'accesorio')),
  costo numeric not null default 0,
  precio_venta numeric not null default 0,
  stock_actual numeric not null default 0,
  stock_minimo numeric default 5,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(business_id, sku)
);

-- 4. MOVIMIENTOS DE INVENTARIO
create table if not exists movimientos_inventario (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  producto_id uuid references inventario(id) not null,
  tipo text not null check (tipo in ('entrada', 'salida', 'ajuste', 'venta', 'uso_taller')),
  cantidad numeric not null,
  motivo text,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CATALOGO DE SERVICIOS (Mano de Obra)
create table if not exists servicios_catalogo (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  nombre text not null,
  descripcion text,
  precio_base numeric not null default 0,
  comision_porcentaje numeric default 0,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. RECETAS APU (Insumos sugeridos por servicio)
create table if not exists recetas_apu (
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  servicio_id uuid references servicios_catalogo(id) on delete cascade not null,
  producto_id uuid references inventario(id) on delete cascade not null,
  cantidad_sugerida numeric not null default 1,
  primary key (servicio_id, producto_id)
);

-- 7. ORDENES DE TRABAJO (Core)
create table if not exists ordenes_trabajo (
  id uuid default gen_random_uuid() primary key,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  estado text default 'Pendiente'
);

-- Agregar columnas SaaS y de Negocio si no existen
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='ordenes_trabajo' and column_name='business_id') then
    alter table ordenes_trabajo add column business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name='ordenes_trabajo' and column_name='bicicleta_id') then
    alter table ordenes_trabajo add column bicicleta_id uuid references bicicletas(id);
  end if;

  if not exists (select 1 from information_schema.columns where table_name='ordenes_trabajo' and column_name='cliente_id') then
    alter table ordenes_trabajo add column cliente_id uuid references clientes(id);
  end if;

  if not exists (select 1 from information_schema.columns where table_name='ordenes_trabajo' and column_name='estado_proceso') then
    alter table ordenes_trabajo add column estado_proceso text default 'abierta' check (estado_proceso in ('abierta', 'en_proceso', 'lista', 'entregada', 'pagada', 'cancelada'));
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name='ordenes_trabajo' and column_name='total') then
    alter table ordenes_trabajo add column total numeric default 0;
  end if;
end $$;

-- 8. DETALLES DE ORDEN (Items de la OT)
create table if not exists ot_detalles (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  orden_id uuid references ordenes_trabajo(id) on delete cascade not null,
  tipo_item text not null check (tipo_item in ('servicio', 'producto')),
  servicio_catalogo_id uuid references servicios_catalogo(id),
  producto_inventario_id uuid references inventario(id),
  descripcion text not null, 
  cantidad numeric not null default 1,
  precio_unitario numeric not null,
  total_linea numeric not null,
  mecanico_id uuid references mecanicos(id),
  comision_monto numeric default 0,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. COMISIONES (Registro inmutable para pagos)
create table if not exists comisiones (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references negocios(id) default '00000000-0000-0000-0000-000000000000'::uuid,
  mecanico_id uuid references mecanicos(id) not null,
  orden_id uuid references ordenes_trabajo(id) not null,
  ot_detalle_id uuid references ot_detalles(id),
  monto numeric not null,
  fecha_calculo timestamp with time zone default timezone('utc'::text, now()) not null,
  estado text default 'pendiente' check (estado in ('pendiente', 'pagada'))
);

-- Habilitar Realtime
alter publication supabase_realtime add table ordenes_trabajo;
alter publication supabase_realtime add table ot_detalles;
alter publication supabase_realtime add table comisiones;
alter publication publication_realtime add table inventario;
alter publication supabase_realtime add table clientes;
alter publication supabase_realtime add table bicicletas;
