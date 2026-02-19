import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ServicioCatalogo, RecetaAPU } from '../types/database';

export interface ServiceWithRecipe extends ServicioCatalogo {
    receta?: RecetaAPU[];
}

export interface RecipeItem {
    id?: string;
    business_id: string;
    servicio_id: string;
    producto_id: string;
    cantidad_sugerida: number;
}

export const useServices = () => {
    const [services, setServices] = useState<ServiceWithRecipe[]>([]);
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

            // Fetch recipes for all services (could be optimized with a join if defined in Supabase, but separate query is safer for now)
            const { data: recipesData, error: recipesError } = await supabase
                .from('recetas_apu')
                .select('*');

            if (recipesError) throw recipesError;

            // Map recipes to services
            const fullServices = (servicesData as ServicioCatalogo[]).map(service => ({
                ...service,
                receta: recipesData?.filter(r => r.servicio_id === service.id) || []
            }));

            setServices(fullServices);
        } catch (err: any) {
            setError(err.message);
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
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'recetas_apu',
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

    const createService = async (serviceData: Omit<ServicioCatalogo, 'id' | 'creado_en'>, recipes: RecipeItem[]) => {
        try {
            // 1. Create Service
            const { data: newService, error: serviceError } = await supabase
                .from('servicios_catalogo')
                .insert([serviceData])
                .select()
                .single();

            if (serviceError) throw serviceError;

            // 2. Create Recipes if any
            if (recipes.length > 0) {
                const recipesToInsert = recipes.map(r => ({
                    business_id: serviceData.business_id,
                    servicio_id: newService.id,
                    producto_id: r.producto_id,
                    cantidad_sugerida: r.cantidad_sugerida
                }));

                const { error: recipesError } = await supabase
                    .from('recetas_apu')
                    .insert(recipesToInsert);

                if (recipesError) throw recipesError;
            }

            await fetchServices();
            return { success: true };
        } catch (err: any) {
            console.error('Error creating service:', err);
            return { success: false, error: err.message };
        }
    };

    const updateService = async (id: string, updates: Partial<ServicioCatalogo>, recipes?: RecipeItem[]) => {
        try {
            // 1. Update Service
            const { error: serviceError } = await supabase
                .from('servicios_catalogo')
                .update(updates)
                .eq('id', id);

            if (serviceError) throw serviceError;

            // 2. Update Recipes if provided
            if (recipes) {
                // Delete existing
                const { error: deleteError } = await supabase
                    .from('recetas_apu')
                    .delete()
                    .eq('servicio_id', id);

                if (deleteError) throw deleteError;

                // Insert new
                if (recipes.length > 0) {
                    // Need business_id, assuming it's same as service or we fetch it? 
                    // We can assume updates.business_id is present or we can fetch the service first. 
                    // But easier: pass business_id or just let RLS handle it?
                    // RLS requires business_id usually.
                    // We can try to get business_id from the services list state if available.

                    const currentService = services.find(s => s.id === id);
                    if (!currentService) throw new Error("Service not found in state");

                    const recipesToInsert = recipes.map(r => ({
                        business_id: currentService.business_id,
                        servicio_id: id,
                        producto_id: r.producto_id,
                        cantidad_sugerida: r.cantidad_sugerida
                    }));

                    const { error: insertError } = await supabase
                        .from('recetas_apu')
                        .insert(recipesToInsert);

                    if (insertError) throw insertError;
                }
            }

            await fetchServices();
            return { success: true };
        } catch (err: any) {
            console.error('Error updating service:', err);
            return { success: false, error: err.message };
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

            // Delete recipes first (cascade might handle it, but explicit checks are good)
            const { error: recipeError } = await supabase
                .from('recetas_apu')
                .delete()
                .eq('servicio_id', id);

            if (recipeError) throw recipeError;

            // Delete service
            const { error } = await supabase
                .from('servicios_catalogo')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchServices();
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting service:', err);
            return { success: false, error: err.message };
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
