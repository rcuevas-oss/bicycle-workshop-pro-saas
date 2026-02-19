import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { OrdenTrabajo, OrdenDetalle } from '../types/database';

export const useWorkOrderDetail = (id: string | undefined) => {
    const [order, setOrder] = useState<OrdenTrabajo | null>(null);
    const [details, setDetails] = useState<OrdenDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = async () => {
        if (!id) return;
        try {
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
          bicicleta:bicicletas(*),
          mecanico:mecanicos(*)
        `)
                .eq('id', id)
                .maybeSingle();

            if (orderError) throw orderError;
            setOrder((orderData as any) || null);

            // Fetch details (Services and Products)
            const { data: detailsData, error: detailsError } = await supabase
                .from('ot_detalles')
                .select('*')
                .eq('orden_id', id);

            if (detailsError) throw detailsError;
            setDetails((detailsData as any) || []);

        } catch (err: any) {
            console.error('Error fetching order:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    return { order, details, loading, error, refresh: fetchDetail };
};
