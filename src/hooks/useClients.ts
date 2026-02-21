import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Cliente, Bicicleta } from '../types/database';

export interface ClientWithBikes extends Cliente {
    bicicletas?: Bicicleta[];
}

export const useClients = () => {
    const [clients, setClients] = useState<ClientWithBikes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = async () => {
        try {
            setLoading(true);
            // Fetch clients with their bikes
            // Note: Supabase join syntax: `*, bicicletas(*)`
            const { data, error } = await supabase
                .from('clientes')
                .select(`
            *,
            bicicletas(*)
        `)
                .order('nombre', { ascending: true });

            if (error) throw error;
            setClients(data as ClientWithBikes[] || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const createClient = async (data: Omit<Cliente, 'id' | 'creado_en'>) => {
        try {
            const { error } = await supabase
                .from('clientes')
                .insert([data]);

            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error creating client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const updateClient = async (id: string, updates: Partial<Cliente>) => {
        try {
            const { error } = await supabase
                .from('clientes')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error updating client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const deleteClient = async (id: string) => {
        try {
            // Check for dependencies (Orders)
            const { count: ordersCount, error: ordersError } = await supabase
                .from('ordenes_trabajo')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', id);

            if (ordersError) throw ordersError;
            if (ordersCount && ordersCount > 0) {
                return { success: false, error: 'No se puede eliminar el cliente porque tiene órdenes de trabajo asociadas.' };
            }

            // Check for dependencies (Bikes)
            const { count: bikesCount, error: bikesError } = await supabase
                .from('bicicletas')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', id);

            if (bikesError) throw bikesError;
            if (bikesCount && bikesCount > 0) {
                return { success: false, error: 'No se puede eliminar el cliente porque tiene bicicletas registradas. Elimine las bicicletas primero.' };
            }

            // Hard delete
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error deleting client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const updateBike = async (id: string, updates: Partial<Bicicleta>) => {
        try {
            const { error } = await supabase
                .from('bicicletas')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error updating bike:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const deleteBike = async (id: string) => {
        try {
            // Check for dependencies (Orders)
            const { count, error: ordersError } = await supabase
                .from('ordenes_trabajo')
                .select('*', { count: 'exact', head: true })
                .eq('bicicleta_id', id);

            if (ordersError) throw ordersError;
            if (count && count > 0) {
                return { success: false, error: 'No se puede eliminar la bicicleta porque tiene órdenes de trabajo asociadas.' };
            }

            const { error } = await supabase
                .from('bicicletas')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error deleting bike:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    useEffect(() => {
        fetchClients();

        const channel = supabase
            .channel('clientes_bicis_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'clientes',
                },
                () => {
                    fetchClients();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bicicletas',
                },
                () => {
                    fetchClients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        clients,
        loading,
        error,
        refresh: fetchClients,
        createClient,
        updateClient,
        deleteClient,
        updateBike,
        deleteBike
    };
};
