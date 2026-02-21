import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CommissionData {
    id: string;
    estado: 'pendiente' | 'pagada';
    monto: number;
    fecha_calculo: string;
    detalle?: { descripcion: string };
    orden?: {
        id: string;
        cliente?: { nombre: string };
        estado_proceso: string;
    };
}

export const useCommissions = (mechanicId?: string) => {
    const [commissions, setCommissions] = useState<CommissionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('comisiones')
                .select(`
                    *,
                    orden:ordenes_trabajo(id, cliente:clientes(nombre), estado_proceso),
                    detalle:ot_detalles(descripcion)
                `)
                .order('fecha_calculo', { ascending: false });

            if (mechanicId) {
                query = query.eq('mecanico_id', mechanicId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setCommissions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [mechanicId]);

    const updateStatus = async (commissionId: string, status: 'pendiente' | 'pagada') => {
        try {
            const { error: updateError } = await supabase
                .from('comisiones')
                .update({ estado: status })
                .eq('id', commissionId);

            if (updateError) throw updateError;
            await fetchCommissions();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [fetchCommissions]);

    return { commissions, loading, error, refresh: fetchCommissions, updateStatus };
};
