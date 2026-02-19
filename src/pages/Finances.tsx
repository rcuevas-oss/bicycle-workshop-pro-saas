import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Calendar,
    Loader2,
    AlertTriangle,
    Calculator,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useFinances, type ReferencePeriod } from '../hooks/useFinances';
import { CashCountModal } from '../components/finances/CashCountModal';

export const Finances: React.FC = () => {
    const { entries, loading, error, period, setPeriod, currentDate } = useFinances();
    const [isCashModalOpen, setIsCashModalOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const totalIngresos = entries
        .filter(e => e.tipo === 'ingreso')
        .reduce((acc, e) => acc + e.monto, 0);

    const totalEgresos = entries
        .filter(e => e.tipo === 'egreso')
        .reduce((acc, e) => acc + e.monto, 0);

    const margenNeto = totalIngresos - totalEgresos;

    // Grouping Logic
    const groupedEntries = entries.reduce((acc, entry) => {
        const dateKey = new Date(entry.fecha).toLocaleDateString('es-CL');
        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: dateKey,
                income: 0,
                expenses: 0,
                movements: []
            };
        }
        if (entry.tipo === 'ingreso') acc[dateKey].income += entry.monto;
        if (entry.tipo === 'egreso') acc[dateKey].expenses += entry.monto;
        acc[dateKey].movements.push(entry);
        return acc;
    }, {} as Record<string, { date: string; income: number; expenses: number; movements: typeof entries }>);

    const toggleGroup = (dateKey: string) => {
        setExpandedGroups(prev =>
            prev.includes(dateKey)
                ? prev.filter(k => k !== dateKey)
                : [...prev, dateKey]
        );
    };

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-red-900 mb-2">Error al cargar finanzas</h2>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    const periods: { id: ReferencePeriod; label: string }[] = [
        { id: 'hoy', label: 'Hoy' },
        { id: 'semana', label: 'Esta Semana' },
        { id: 'quincena', label: '15 Días' },
        { id: 'mes', label: 'Este Mes' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Consolidado Contable</h1>
                    <p className="text-slate-500 font-medium">Estado de resultados: {currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        {periods.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsCashModalOpen(true)}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2"
                    >
                        <Calculator size={18} /> Arqueo Caja
                    </button>
                </div>
            </div>

            {/* Metrics (P&L Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <ArrowUpCircle size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Ingresos</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">${totalIngresos.toLocaleString('es-CL')}</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Ventas y Servicios</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                <ArrowDownCircle size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-lg">Egresos</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">${totalEgresos.toLocaleString('es-CL')}</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Comisiones y Costos</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-200 bg-white/10 px-2 py-1 rounded-lg">Utilidad</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">${margenNeto.toLocaleString('es-CL')}</h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">Margen Operativo</p>
                    </div>
                </div>
            </div>

            {/* Consolidated Table */}
            <Card title="Detalle de Movimientos (Consolidado)" className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Calculando balances...</p>
                    </div>
                ) : Object.keys(groupedEntries).length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-slate-500 font-medium">No hay movimientos registrados para este período.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Fecha</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Resumen</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Ingresos</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Egresos</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Balance</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.values(groupedEntries).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((group) => {
                                    const isExpanded = expandedGroups.includes(group.date);
                                    const balance = group.income - group.expenses;

                                    return (
                                        <React.Fragment key={group.date}>
                                            <tr
                                                onClick={() => toggleGroup(group.date)}
                                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                        <Calendar size={16} className="text-blue-500" />
                                                        {group.date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                                        {group.movements.length} Movimientos
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                    +${group.income.toLocaleString('es-CL')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-red-600">
                                                    -${group.expenses.toLocaleString('es-CL')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900">
                                                    ${balance.toLocaleString('es-CL')}
                                                </td>
                                                <td className="px-4 text-slate-300">
                                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <td colSpan={6} className="p-0">
                                                        <div className="border-t border-b border-slate-100 divide-y divide-slate-100">
                                                            {group.movements.map((mov, idx) => (
                                                                <div key={idx} className="flex items-center justify-between px-12 py-3 hover:bg-white transition-colors">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-2 h-2 rounded-full ${mov.tipo === 'ingreso' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                                        <span className="text-sm font-medium text-slate-600">{mov.descripcion}</span>
                                                                        <Badge variant={mov.categoria === 'Comisión' ? 'warning' : 'default'} className="scale-75 origin-left">
                                                                            {mov.categoria}
                                                                        </Badge>
                                                                    </div>
                                                                    <span className={`text-sm font-bold ${mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {mov.tipo === 'ingreso' ? '+' : '-'}${mov.monto.toLocaleString('es-CL')}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <CashCountModal
                isOpen={isCashModalOpen}
                onClose={() => setIsCashModalOpen(false)}
                expectedCash={totalIngresos} // Simplification: assume all income is cash for now
            />
        </div>
    );
};
