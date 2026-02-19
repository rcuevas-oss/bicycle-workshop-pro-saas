import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Timeline } from '../components/ui/Timeline';
import { Wrench, DollarSign, Bike, AlertTriangle, Filter, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { WelcomeGuide } from '../components/dashboard/WelcomeGuide';
// import { useAuth } from '../context/AuthContext'; // Assuming this path for useAuth

import { CreateOrderModal } from '../components/work-orders/CreateOrderModal';

export const Dashboard: React.FC = () => {
    // const { perfil } = useAuth(); // Unused for now
    const { orders, error } = useWorkOrders();
    // const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today'); // Unused for now
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const stats = [
        {
            label: 'Órdenes Abiertas',
            value: orders.filter(o => o.estado !== 'Entregado' && o.estado !== 'Completado').length.toString(),
            icon: <Wrench size={24} />,
            trend: '+2 hoy',
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-100'
        },
        {
            label: 'Ingresos Hoy',
            value: `$${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString('es-CL')}`,
            icon: <DollarSign size={24} />,
            trend: '+15% vs ayer',
            color: 'green',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100'
        },
        {
            label: 'Bicicletas en Taller',
            value: orders.filter(o => o.estado !== 'Entregado').length.toString(),
            icon: <Bike size={24} />,
            trend: '3 listas',
            color: 'purple',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            border: 'border-indigo-100'
        },
        {
            label: 'Stock Bajo',
            value: '4', // Mock content for now
            icon: <AlertTriangle size={24} />,
            trend: 'Crítico',
            color: 'orange',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100'
        },
    ];

    const recentEvents = [
        { id: '1', title: 'Servicio Completado', description: 'Juan P. finalizó Mantenimiento General (Trek Marlin 5)', time: 'Hace 15 min', type: 'success' },
        { id: '2', title: 'Nueva Orden', description: 'Recibida: Specialized Rockhopper (Frenos)', time: 'Hace 45 min', type: 'start' },
        { id: '3', title: 'Stock Crítico', description: 'Cámaras 29" por debajo del mínimo', time: 'Hace 1h', type: 'warning' },
        { id: '4', title: 'Comentario Agregado', description: 'Cliente aprobó cambio de cadena', time: 'Hace 2h', type: 'info' },
    ];

    // We no longer block the entire dashboard with a full-screen loader.
    // Instead, stats and tables will show empty or simplified states while fetching.

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-black text-red-900 mb-2">Error al cargar datos</h2>
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {orders.length === 0 && <WelcomeGuide />}

            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 font-medium">Resumen general del taller para hoy</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={18} /> Filtrar
                    </button>
                    <button
                        onClick={() => setIsOrderModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} /> Nueva Orden
                    </button>
                    <CreateOrderModal
                        isOpen={isOrderModalOpen}
                        onClose={() => setIsOrderModalOpen(false)}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`relative overflow-hidden p-6 bg-white border ${stat.border} rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${stat.bg} opacity-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="relative flex justify-between items-start mb-6">
                            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.text} shadow-sm border border-white/50`}>
                                {stat.icon}
                            </div>
                            <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 shadow-sm flex items-center gap-1">
                                <TrendingUp size={12} className={stat.text} />
                                {stat.trend}
                            </div>
                        </div>
                        <div className="relative">
                            <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Work Orders */}
                <div className="lg:col-span-8">
                    <Card
                        className="h-full border-0 shadow-xl shadow-slate-200/50"
                        title="Órdenes de Trabajo Activas"
                        action={
                            <Link to="/work-orders" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                Ver todas <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        }
                    >
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 animate-bounce">
                                    <Wrench size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">¡Bienvenido a tu Taller!</h3>
                                <p className="text-slate-500 font-medium max-w-sm mb-6">
                                    Aún no tienes órdenes de trabajo. Comienza registrando tu primera reparación para ver la magia en acción.
                                </p>
                                <Link
                                    to="/work-orders"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Plus size={20} /> Crear Primera Orden
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-4 sm:-mx-6">
                                <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                                    <table className="min-w-full table-fixed divide-y divide-slate-100">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Bicicleta / Cliente</th>
                                                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrega</th>
                                                <th className="px-4 py-4 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-4 py-5 whitespace-nowrap font-black text-sm text-slate-900 font-mono tracking-tight">{order.id.slice(0, 8)}</td>
                                                    <td className="px-4 py-5">
                                                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.bici_modelo || 'Modelo V2'}</div>
                                                        <div className="text-xs text-slate-400 font-medium">{order.cliente_nombre || 'Cliente'} • {order.mecanico?.nombre || 'Sin asignar'}</div>
                                                    </td>
                                                    <td className="px-4 py-5 whitespace-nowrap">
                                                        <Badge variant={
                                                            (order.estado === 'En Progreso' || order.estado_proceso === 'en_proceso') ? 'info' :
                                                                (order.estado === 'Pendiente' || order.estado_proceso === 'abierta') ? 'default' :
                                                                    (order.estado === 'Completado' || order.estado_proceso === 'lista') ? 'success' :
                                                                        (order.estado === 'Pagada' || order.estado_proceso === 'pagada') ? 'success' : 'warning'
                                                        }>{order.estado || order.estado_proceso}</Badge>
                                                    </td>
                                                    <td className="px-4 py-5 whitespace-nowrap font-bold text-sm text-slate-500">{order.fecha_entrega || 'N/A'}</td>
                                                    <td className="px-4 py-5 whitespace-nowrap text-right">
                                                        <Link to={`/work-orders/${order.id}`} className="p-2 inline-block text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                            <ChevronRight size={18} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Timeline Widget */}
                <div className="lg:col-span-4">
                    <Card title="Actividad Reciente" className="h-full border-0 shadow-xl shadow-slate-200/50">
                        <Timeline items={recentEvents as any} />
                        <button className="w-full mt-6 py-3 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all">
                            Ver registros completos
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
