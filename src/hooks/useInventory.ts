import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { InventarioItem } from '../types/database';

export const useInventory = () => {
    const [products, setProducts] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventario')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setProducts(data as InventarioItem[] || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();

        const channel = supabase
            .channel('inventario_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventario',
                },
                () => {
                    fetchInventory();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const createProduct = async (data: Omit<InventarioItem, 'id' | 'creado_en'>) => {
        try {
            const { error } = await supabase
                .from('inventario')
                .insert([data]);

            if (error) throw error;
            await fetchInventory();
            return { success: true };
        } catch (err) {
            console.error('Error creating product:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const updateProduct = async (id: string, updates: Partial<InventarioItem>) => {
        try {
            const { error } = await supabase
                .from('inventario')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchInventory();
            return { success: true };
        } catch (err) {
            console.error('Error updating product:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            // Check for dependencies (Orders)
            const { count: ordersCount, error: ordersError } = await supabase
                .from('ot_detalles')
                .select('*', { count: 'exact', head: true })
                .eq('producto_inventario_id', id);

            if (ordersError) throw ordersError;
            if (ordersCount && ordersCount > 0) {
                return { success: false, error: 'No se puede eliminar el producto porque ha sido utilizado en órdenes de trabajo.' };
            }

            // Removed legacy check on recetas_apu during delete

            // Delete
            const { error } = await supabase
                .from('inventario')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchInventory();
            return { success: true };
        } catch (err) {
            console.error('Error deleting product:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    return {
        products,
        loading,
        error,
        refresh: fetchInventory,
        createProduct,
        updateProduct,
        deleteProduct
    };
};
