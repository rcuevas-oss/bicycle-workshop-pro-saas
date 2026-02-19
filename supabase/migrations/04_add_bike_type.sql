-- Agregar columna 'tipo' a la tabla bicicletas
ALTER TABLE bicicletas 
ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'Otra' CHECK (tipo IN ('Ruta', 'MTB', 'Urbana', 'E-Bike', 'Infantil', 'Otra'));

-- Comentario para documentación
COMMENT ON COLUMN bicicletas.tipo IS 'Clasificación de la bicicleta para estadísticas (Ruta, MTB, etc.)';
