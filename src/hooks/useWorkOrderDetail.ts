import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { OrdenTrabajo, OrdenDetalle } from '../types/database';

export const useWorkOrderDetail = (id: string | undefined) => {
    const [order, setOrder] = useState<OrdenTrabajo | null>(null);
    const [details, setDetails] = useState<OrdenDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            // Do NOT nullify existing data on refresh to prevent UI crashes 
            // if components expect strict shapes and the loading state isn't perfectly handled.
            setLoading(true);

            // Fetch order with mechanic
            // Note: mecanicos might be a separate table or linked via auth. For now assuming mecanicos table/view still exists or we select mecanico_id
            // In V2 migration, we kept mecanicos table implicit reference. 
            // If we assume the query still works or needs adjustment.
            // Let's try to select everything.
            const { data: orderData, error: orderError } = await supabase
                .from('ordenes_trabajo')
                .select(`
          *,
          cliente:clientes(*),
          bicicleta:bicicletas(*, cliente:clientes(*)),
          mecanico:mecanicos(*)
        `)
                .eq('id', id)
                .maybeSingle();

            if (orderError) throw orderError;
            setOrder((orderData as unknown as OrdenTrabajo) || null);

            // Fetch details (Services and Products)
            const { data: detailsData, error: detailsError } = await supabase
                .from('ot_detalles')
                .select('*')
                .eq('orden_id', id);

            if (detailsError) throw detailsError;
            setDetails((detailsData as unknown as OrdenDetalle[]) || []);

        } catch (err) {
            console.error('Error fetching order:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { order, details, loading, error, refresh: fetchDetail };
};
