import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfDay, startOfWeek, subDays, startOfMonth, endOfDay } from 'date-fns';


export interface FinancialEntry {
    fecha: string;
    descripcion: string;
    monto: number;
    tipo: 'ingreso' | 'egreso';
    categoria: string;
    detalle?: any; // Para drill-down
}

export type ReferencePeriod = 'hoy' | 'semana' | 'quincena' | 'mes';

export const useFinances = () => {
    const [entries, setEntries] = useState<FinancialEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<ReferencePeriod>('mes');
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchFinances = async () => {
        setLoading(true);
        try {
            // Determinar rango de fechas
            let startDate = new Date();
            const endDate = endOfDay(currentDate);

            switch (period) {
                case 'hoy':
                    startDate = startOfDay(currentDate);
                    break;
                case 'semana':
                    startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
                    break;
                case 'quincena':
                    startDate = subDays(currentDate, 15);
                    break;
                case 'mes':
                    startDate = startOfMonth(currentDate);
                    break;
            }

            // 1. Fetch Paid Orders for income with glosa
            const { data: orders, error: ordersError } = await supabase
                .from('ordenes_trabajo')
                .select(`
                    id, 
                    creado_en, 
                    total,
                    detalles:ot_detalles(descripcion, total_linea)
                `)
                .eq('estado_proceso', 'pagada')
                .gte('creado_en', startDate.toISOString())
                .lte('creado_en', endDate.toISOString());

            if (ordersError) throw ordersError;

            // 2. Fetch Commissions for expenses
            const { data: commissions, error: commissionsError } = await supabase
                .from('comisiones')
                .select('monto, fecha_calculo, detalle:ot_detalles(descripcion)')
                .gte('fecha_calculo', startDate.toISOString())
                .lte('fecha_calculo', endDate.toISOString());

            if (commissionsError) throw commissionsError;

            const allEntries: FinancialEntry[] = [];

            // Add incomes from order items
            orders.forEach(order => {
                order.detalles?.forEach((det: any) => {
                    allEntries.push({
                        fecha: order.creado_en,
                        descripcion: det.descripcion,
                        monto: det.total_linea,
                        tipo: 'ingreso',
                        categoria: 'Venta/Servicio'
                    });
                });
            });

            // Add expenses from commissions
            commissions.forEach((comm: any) => {
                const desc = Array.isArray(comm.detalle)
                    ? comm.detalle[0]?.descripcion
                    : comm.detalle?.descripcion;

                allEntries.push({
                    fecha: comm.fecha_calculo,
                    descripcion: `Comisión: ${desc || 'Servicio'}`,
                    monto: comm.monto,
                    tipo: 'egreso',
                    categoria: 'Comisión'
                });
            });

            // Sort by date
            allEntries.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

            setEntries(allEntries);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinances();
    }, [period, currentDate]);

    return { entries, loading, error, period, setPeriod, currentDate, setCurrentDate, refresh: fetchFinances };
};
