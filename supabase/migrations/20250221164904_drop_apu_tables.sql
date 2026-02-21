-- Eliminar tablas relacionadas al sistema APU antiguo que ha sido reemplazado por Checklist Digital

-- 1. Eliminar recetas asociadas a servicios (dependen de catalogo y productos)
DROP TABLE IF EXISTS public.recetas_apu;

-- 2. Eliminar items de plantillas (dependen de plantillas y productos)
DROP TABLE IF EXISTS public.plantillas_apu_items;

-- 3. Eliminar cabeceras de plantillas
DROP TABLE IF EXISTS public.plantillas_apu;

-- Nota: La columna `checklist_recepcion` ya fue añadida manualmente en migraciones previas o por la UI de Supabase, 
-- pero nos aseguramos de no romper dependencias.
