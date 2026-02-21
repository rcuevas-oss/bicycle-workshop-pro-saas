import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ServicioCatalogo } from '../types/database';

export const useServices = () => {
    const [services, setServices] = useState<ServicioCatalogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = async () => {
        try {
            setLoading(true);
            // Fetch services
            const { data: servicesData, error: servicesError } = await supabase
                .from('servicios_catalogo')
                .select('*')
                .order('nombre', { ascending: true });

            if (servicesError) throw servicesError;

            setServices(servicesData as ServicioCatalogo[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();

        const channel = supabase
            .channel('servicios_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'servicios_catalogo',
                },
                () => {
                    fetchServices();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const createService = async (serviceData: Omit<ServicioCatalogo, 'id' | 'creado_en'>) => {
        try {
            // 1. Create Service
            const { error: serviceError } = await supabase
                .from('servicios_catalogo')
                .insert([serviceData])
                .select()
                .single();

            if (serviceError) throw serviceError;

            await fetchServices();
            return { success: true };
        } catch (err) {
            console.error('Error creating service:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const updateService = async (id: string, updates: Partial<ServicioCatalogo>) => {
        try {
            // 1. Update Service
            const { error: serviceError } = await supabase
                .from('servicios_catalogo')
                .update(updates)
                .eq('id', id);

            if (serviceError) throw serviceError;

            await fetchServices();
            return { success: true };
        } catch (err) {
            console.error('Error updating service:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const deleteService = async (id: string) => {
        try {
            // Validation: Check if used in Orders
            const { count, error: countError } = await supabase
                .from('ot_detalles')
                .select('*', { count: 'exact', head: true })
                .eq('servicio_catalogo_id', id);

            if (countError) throw countError;

            if (count && count > 0) {
                return { success: false, error: 'No se puede eliminar este servicio porque ha sido utilizado en órdenes de trabajo históricas.' };
            }

            // Delete service
            const { error } = await supabase
                .from('servicios_catalogo')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchServices();
            return { success: true };
        } catch (err) {
            console.error('Error deleting service:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    return {
        services,
        loading,
        error,
        refresh: fetchServices,
        createService,
        updateService,
        deleteService
    };
};
