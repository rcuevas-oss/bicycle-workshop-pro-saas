import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno para Supabase. Verifica tu archivo .env local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAllTestData() {
    console.log("Iniciando borrado intensivo de datos zombis de prueba...");

    // Tablas a limpiar en orden de dependencias (de hijas a padres para evitar violaciones de foreign keys si las hay)
    const tablesToClean = [
        'transacciones_financieras',
        'comisiones',
        'ot_detalles',
        'ordenes_trabajo',
        'bicicletas',
        'clientes',
        'servicios_catalogo',
        'productos_inventario',
        'mecanicos'
    ];

    // Identificador UUID falso pero con formato correcto para no dar error de sintaxis en DB
    const dummyUUID = '00000000-0000-0000-0000-000000000000';

    for (const table of tablesToClean) {
        console.log(`Borrando datos de la tabla: ${table}...`);
        const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', dummyUUID);

        if (error) {
            console.error(`Error al borrar en ${table}:`, error.message);
        } else {
            console.log(`-> ${table} vaciada exitosamente.`);
        }
    }

    console.log("Proceso de limpieza masiva terminado.");
}

cleanAllTestData();
