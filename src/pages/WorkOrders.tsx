import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
    Wrench, Search, Plus, Calendar,
    User, Bike, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { CreateOrderModal } from '../components/work-orders/CreateOrderModal';

export const WorkOrders: React.FC = () => {
    const navigate = useNavigate();
    const { orders, loading } = useWorkOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('todos');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.slice(0, 8).includes(searchTerm.toLowerCase()) ||
            order.bicicleta?.modelo?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'todos' || order.estado_proceso === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'abierta': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'en_proceso': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'lista': return 'bg-lime-100 text-lime-700 border-lime-200';
            case 'entregada': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'pagada': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Taller</h1>
                    <p className="text-slate-500 font-medium">Gestión de órdenes de trabajo</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                    >
                        <Plus size={18} /> Nueva Orden
                    </button>
                </div>
            </div>

            {/* Filters & List */}
            <Card className="border-0 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por cliente, bici o ID..."
                            icon={<Search size={18} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {(['todos', 'abierta', 'en_proceso', 'lista', 'entregada', 'pagada'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`
                                    px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all
                                    ${statusFilter === status
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }
                                `}
                            >
                                {status === 'todos' ? 'TODAS' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Cargando órdenes...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-medium italic">No se encontraron órdenes.</div>
                    ) : (
                        filteredOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/work-orders/${order.id}`)}
                                className="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col md:flex-row gap-6 relative overflow-hidden"
                            >
                                {/* Status Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(order.estado_proceso || 'abierta').split(' ')[0]}`}></div>

                                {/* ID & Date */}
                                <div className="flex flex-col justify-center min-w-[100px]">
                                    <span className="font-mono text-xs font-bold text-slate-400">#{order.id.slice(0, 8)}</span>
                                    <div className="flex items-center gap-1 text-slate-500 mt-1">
                                        <Calendar size={12} />
                                        <span className="text-xs font-medium">{new Date(order.creado_en).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 grid md:grid-cols-2 gap-4">
                                    {/* Client & Bike */}
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <User size={14} className="text-slate-400" />
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                {order.cliente?.nombre || order.cliente_nombre || 'Cliente Desconocido'}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                            <Bike size={14} />
                                            <span>{order.bicicleta?.modelo || order.bici_modelo || 'Sin bicicleta'}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="uppercase text-xs">{order.bicicleta?.marca || '---'}</span>
                                        </div>
                                    </div>

                                    {/* Mechanic & Details */}
                                    <div className="flex flex-col justify-center items-start md:items-end">
                                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(order.estado_proceso || 'abierta')}`}>
                                            {getStatusLabel(order.estado_proceso || 'abierta')}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {order.mecanico && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                                    <Wrench size={12} /> {order.mecanico.nombre}
                                                </span>
                                            )}
                                            <span className="font-black text-slate-900 text-lg ml-2">
                                                ${(order.total || 0).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};
