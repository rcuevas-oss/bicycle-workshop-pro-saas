-- Tabla para almacenar las plantillas de recetas (APU)
CREATE TABLE IF NOT EXISTS plantillas_apu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_base_sugerido DECIMAL(10,2) DEFAULT 0,
    categoria TEXT DEFAULT 'General',
    es_publica BOOLEAN DEFAULT TRUE,
    negocio_id UUID REFERENCES negocios(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para los ingredientes de la plantilla
CREATE TABLE IF NOT EXISTS plantillas_apu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plantilla_id UUID REFERENCES plantillas_apu(id) ON DELETE CASCADE,
    nombre_insumo_generico TEXT NOT NULL,
    cantidad_sugerida DECIMAL(10,4) NOT NULL,
    unidad_medida TEXT NOT NULL DEFAULT 'un'
);

-- Insertar algunas plantillas de ejemplo (Seed Data)
INSERT INTO plantillas_apu (nombre, descripcion, precio_base_sugerido, categoria, es_publica) VALUES
('Sangrado de Freno Hidráulico (Shimano)', 'Servicio completo de purgado y reemplazo de fluido para frenos minerales.', 15000, 'Frenos', TRUE),
('Mantención Maza Trasera', 'Limpieza, engrasado y ajuste de rodamientos de maza.', 18000, 'Ruedas', TRUE),
('Instalación Tubeless (Por Rueda)', 'Cintado de llanta, instalación de válvula y líquido sellante.', 12000, 'Ruedas', TRUE)
ON CONFLICT DO NOTHING;

-- Insertar items para Sangrado Shimano
INSERT INTO plantillas_apu_items (plantilla_id, nombre_insumo_generico, cantidad_sugerida, unidad_medida) 
SELECT id, 'Aceite Mineral Shimano', 60, 'ml' FROM plantillas_apu WHERE nombre = 'Sangrado de Freno Hidráulico (Shimano)'
ON CONFLICT DO NOTHING;

-- Insertar items para Mantención Maza
INSERT INTO plantillas_apu_items (plantilla_id, nombre_insumo_generico, cantidad_sugerida, unidad_medida)
SELECT id, 'Grasa de Litio Premium', 15, 'gr' FROM plantillas_apu WHERE nombre = 'Mantención Maza Trasera'
ON CONFLICT DO NOTHING;

INSERT INTO plantillas_apu_items (plantilla_id, nombre_insumo_generico, cantidad_sugerida, unidad_medida)
SELECT id, 'Desengrasante Biodegradable', 50, 'ml' FROM plantillas_apu WHERE nombre = 'Mantención Maza Trasera'
ON CONFLICT DO NOTHING;

-- Insertar items para Tubeless
INSERT INTO plantillas_apu_items (plantilla_id, nombre_insumo_generico, cantidad_sugerida, unidad_medida)
SELECT id, 'Líquido Sellante', 100, 'ml' FROM plantillas_apu WHERE nombre = 'Instalación Tubeless (Por Rueda)'
ON CONFLICT DO NOTHING;

INSERT INTO plantillas_apu_items (plantilla_id, nombre_insumo_generico, cantidad_sugerida, unidad_medida)
SELECT id, 'Cinta Tubeless', 2.5, 'mt' FROM plantillas_apu WHERE nombre = 'Instalación Tubeless (Por Rueda)'
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE plantillas_apu ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_apu_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
DROP POLICY IF EXISTS "Ver plantillas públicas y propias" ON plantillas_apu;
CREATE POLICY "Ver plantillas públicas y propias" ON plantillas_apu
FOR SELECT USING (
    es_publica = TRUE OR 
    negocio_id IN (SELECT negocio_id FROM perfiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Gestión de plantillas propias" ON plantillas_apu;
CREATE POLICY "Gestión de plantillas propias" ON plantillas_apu
FOR ALL USING (
    negocio_id IN (SELECT negocio_id FROM perfiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Ver items de plantillas visibles" ON plantillas_apu_items;
CREATE POLICY "Ver items de plantillas visibles" ON plantillas_apu_items
FOR SELECT USING (
    plantilla_id IN (SELECT id FROM plantillas_apu)
);
