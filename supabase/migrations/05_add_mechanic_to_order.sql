-- Agregar columna 'mecanico_id' a la tabla ordenes_trabajo para el mecánico responsable
ALTER TABLE ordenes_trabajo 
ADD COLUMN IF NOT EXISTS mecanico_id uuid references mecanicos(id);

-- Comentario
COMMENT ON COLUMN ordenes_trabajo.mecanico_id IS 'Mecánico responsable o líder de la orden de trabajo';
