-- Asegurar que la política de RLS para ordenes_trabajo permita todas las acciones (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Tenant Isolation Ordenes" ON ordenes_trabajo;

CREATE POLICY "Tenant Isolation Ordenes" ON ordenes_trabajo
    FOR ALL
    USING (business_id = get_my_business_id())
    WITH CHECK (business_id = get_my_business_id());
