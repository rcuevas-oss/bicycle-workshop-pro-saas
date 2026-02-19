import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { OrdenTrabajo } from '../types/database';

export const useWorkOrders = () => {
    const [orders, setOrders] = useState<OrdenTrabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            console.log('useWorkOrders: Starting fetch...');
            setLoading(true);
            const { data, error } = await supabase
                .from('ordenes_trabajo')
                .select(`
          *,
          cliente:clientes(*),
          bicicleta:bicicletas(*),
          mecanico:mecanicos(*)
        `)
                .order('creado_en', { ascending: false });

            if (error) {
                console.error('useWorkOrders: Filter error:', error);
                throw error;
            }
            console.log('useWorkOrders: Data received:', data?.length || 0, 'rows');
            setOrders((data as any) || []);
        } catch (err: any) {
            console.error('useWorkOrders: Catch error:', err);
            setError(err.message);
        } finally {
            console.log('useWorkOrders: Fetch finished.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const channel = supabase
            .channel('ordenes_trabajo_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'ordenes_trabajo',
                },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { orders, loading, error, refresh: fetchOrders };
};
