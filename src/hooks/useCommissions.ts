import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCommissions = (mechanicId?: string) => {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCommissions = async () => {
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (commissionId: string, status: 'pendiente' | 'pagada') => {
        try {
            const { error: updateError } = await supabase
                .from('comisiones')
                .update({ estado: status })
                .eq('id', commissionId);

            if (updateError) throw updateError;
            await fetchCommissions();
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [mechanicId]);

    return { commissions, loading, error, refresh: fetchCommissions, updateStatus };
};
