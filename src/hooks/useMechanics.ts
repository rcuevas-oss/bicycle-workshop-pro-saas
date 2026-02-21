import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Mecanico } from '../types/database';

export const useMechanics = () => {
    const [mechanics, setMechanics] = useState<Mecanico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMechanics = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mecanicos')
                .select('*')
                .eq('activo', true)
                .order('nombre', { ascending: true });

            if (error) throw error;
            setMechanics(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const createMechanic = async (data: { nombre: string; especialidad: string; business_id: string }) => {
        try {
            const { error } = await supabase
                .from('mecanicos')
                .insert([{ ...data, activo: true }]);

            if (error) throw error;
            await fetchMechanics();
            return { success: true };
        } catch (err) {
            console.error('Error creating mechanic:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const updateMechanic = async (id: string, updates: Partial<Mecanico>) => {
        try {
            const { error } = await supabase
                .from('mecanicos')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchMechanics();
            return { success: true };
        } catch (err) {
            console.error('Error updating mechanic:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    const deleteMechanic = async (id: string) => {
        try {
            // Soft delete
            const { error } = await supabase
                .from('mecanicos')
                .update({ activo: false })
                .eq('id', id);

            if (error) throw error;
            await fetchMechanics();
            return { success: true };
        } catch (err) {
            console.error('Error deleting mechanic:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    };

    useEffect(() => {
        fetchMechanics();
    }, []);

    return {
        mechanics,
        loading,
        error,
        refresh: fetchMechanics,
        createMechanic,
        updateMechanic,
        deleteMechanic
    };
};
