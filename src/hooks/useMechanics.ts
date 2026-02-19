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
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            console.error('Error creating mechanic:', err);
            return { success: false, error: err.message };
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
        } catch (err: any) {
            console.error('Error updating mechanic:', err);
            return { success: false, error: err.message };
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
        } catch (err: any) {
            console.error('Error deleting mechanic:', err);
            return { success: false, error: err.message };
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
