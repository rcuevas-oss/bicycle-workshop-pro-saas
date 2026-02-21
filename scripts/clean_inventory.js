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

async function cleanInventory() {
    console.log("Iniciando limpieza de la tabla inventario...");

    const dummyUUID = '00000000-0000-0000-0000-000000000000';

    const { error } = await supabase
        .from('inventario')
        .delete()
        .neq('id', dummyUUID);

    if (error) {
        console.error(`Error al borrar en inventario:`, error.message);
    } else {
        console.log(`-> inventario vaciada exitosamente.`);
    }

    console.log("Limpieza de inventario terminada.");
}

cleanInventory();
