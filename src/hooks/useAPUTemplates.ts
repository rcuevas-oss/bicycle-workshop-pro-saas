import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PlantillaAPU, PlantillaAPUItem } from '../types/database';

export interface PlantillaWithItems extends PlantillaAPU {
    items: PlantillaAPUItem[];
}

export const useAPUTemplates = () => {
    const [templates, setTemplates] = useState<PlantillaWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            // 1. Fetch Templates
            const { data: templatesData, error: templatesError } = await supabase
                .from('plantillas_apu')
                .select('*')
                .order('nombre');

            if (templatesError) throw templatesError;

            // 2. Fetch Items for all templates (simplified for now, could be join)
            const { data: itemsData, error: itemsError } = await supabase
                .from('plantillas_apu_items')
                .select('*');

            if (itemsError) throw itemsError;

            // 3. Merge
            const merged: PlantillaWithItems[] = (templatesData || []).map(t => ({
                ...t,
                items: (itemsData || []).filter(i => i.plantilla_id === t.id)
            }));

            setTemplates(merged);
        } catch (err: any) {
            console.error('Error fetching APU templates:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return { templates, loading, error, refresh: fetchTemplates };
};
