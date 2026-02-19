import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Timeline } from '../components/ui/Timeline';
import {
    ArrowLeft, User, Bike, Calendar, Phone, Mail, Hash,
    PenTool, Layers, Loader2, AlertTriangle, Package,
    Wrench, CheckCircle2, Trash2
} from 'lucide-react';
import { useWorkOrderDetail } from '../hooks/useWorkOrderDetail';
import { AddServiceModal } from '../components/work-orders/AddServiceModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { supabase } from '../lib/supabase';

export const WorkOrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { order, details, loading, error, refresh } = useWorkOrderDetail(id);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = React.useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-500 font-bold animate-pulse">Cargando detalles de la orden...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-black text-red-900 mb-2">Orden no encontrada</h2>
                <p className="text-red-700 font-medium mb-6">{error || 'La orden solicitada no existe o no pudo ser cargada.'}</p>
                <Link
                    to="/"
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 inline-block"
                >
                    Volver al Panel
                </Link>
            </div>
        );
    }

    const timelineEvents = [
        { id: '1', title: 'Orden Creada', description: 'Recepcionado en sistema', time: new Date(order.creado_en).toLocaleString('es-CL'), type: 'start' as const },
        { id: '2', title: 'Estado Actual', description: order.estado || order.estado_proceso, time: 'Ahora', type: 'info' as const },
    ];

    const servicios = details.filter(d => d.tipo_item === 'servicio');
    const productos = details.filter(d => d.tipo_item === 'producto');

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const { error } = await supabase
                .from('ordenes_trabajo')
                .update({ estado_proceso: newStatus, estado: newStatus === 'lista' ? 'Completado' : newStatus === 'entregada' ? 'Entregada' : 'En Progreso' }) // Sync legacy
                .eq('id', order.id);

            if (error) throw error;
            refresh();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error al actualizar estado.");
        }
    };

    const handlePayment = async () => {
        if (!confirm("¿Confirmar pago y cerrar orden? Esto generará las comisiones.")) return;

        try {
            // 1. Generate Commissions Snapshot
            const commissionItems = details.filter(d => d.comision_monto > 0 && d.mecanico_id);

            if (commissionItems.length > 0) {
                const commissionsToInsert = commissionItems.map(item => ({
                    business_id: order.business_id,
                    mecanico_id: item.mecanico_id,
                    orden_id: order.id,
                    ot_detalle_id: item.id,
                    monto: item.comision_monto,
                    estado: 'pendiente'
                }));

                const { error: commError } = await supabase
                    .from('comisiones')
                    .insert(commissionsToInsert);

                if (commError) throw commError;
            }

            // 2. Update Status to Paid
            const { error } = await supabase
                .from('ordenes_trabajo')
                .update({
                    estado_proceso: 'pagada',
                    estado: 'Pagada',
                    // fecha_entrega: new Date().toISOString() // Could update actual delivery time
                })
                .eq('id', order.id);

            if (error) throw error;
            refresh();

        } catch (err) {
            console.error("Error processing payment:", err);
            alert("Error al procesar pago y comisiones.");
        }
    };

    const handleCancelOrder = async () => {
        try {
            const { error } = await supabase
                .from('ordenes_trabajo')
                .update({
                    estado_proceso: 'cancelada',
                    estado: 'Cancelada'
                })
                .eq('id', order.id);

            if (error) throw error;
            setIsCancelModalOpen(false);
            refresh();
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert("Error al cancelar la orden.");
        }
    };

    const handleReopenOrder = async () => {
        try {
            const { error } = await supabase
                .from('ordenes_trabajo')
                .update({
                    estado_proceso: 'abierta',
                    estado: 'Abierta'
                })
                .eq('id', order.id);

            if (error) throw error;
            refresh();
        } catch (err) {
            console.error("Error reopening order:", err);
            alert("Error al reabrir la orden.");
        }
    };

    const handleDeleteOrder = async () => {
        if (!order) return;
        setDeleting(true);
        try {
            // 1. Delete Details (Cascading manually to be safe)
            const { error: detError } = await supabase
                .from('ot_detalles')
                .delete()
                .eq('orden_id', order.id);

            if (detError) throw detError;

            // 2. Delete Order
            const { error: ordError } = await supabase
                .from('ordenes_trabajo')
                .delete()
                .eq('id', order.id);

            if (ordError) throw ordError;

            navigate('/work-orders');
        } catch (err: any) {
            console.error("Error deleting order:", err);
            alert("Error al eliminar la orden: " + err.message);
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const renderActionButtons = () => {
        const status = order.estado_proceso || 'abierta';

        if (status === 'pagada') {
            return (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} /> Orden Finalizada y Pagada
                </div>
            );
        }

        if (status === 'cancelada') {
            return (
                <button
                    onClick={handleReopenOrder}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                    Reactivar Orden
                </button>
            );
        }

        return (
            <div className="flex gap-3 w-full md:w-auto">
                <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                    Anular
                </button>

                {status === 'lista' && (
                    // ...
                    <button
                        onClick={() => handleStatusUpdate('entregada')}
                        className="flex-1 md:flex-none px-6 py-3 bg-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                    >
                        Entregar a Cliente
                    </button>
                )}

                {status === 'entregada' && (
                    <button
                        onClick={handlePayment}
                        className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        Registrar Pago ($)
                    </button>
                )}

                {(status === 'abierta' || status === 'en_proceso') && (
                    <button
                        onClick={() => handleStatusUpdate('lista')}
                        className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        Finalizar Trabajo
                    </button>
                )}

                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    title="Eliminar permanentemente"
                >
                    <Trash2 size={22} />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-5">
                    <Link to="/" className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orden #{order.id.slice(0, 8)}</h1>
                            <Badge variant={
                                (order.estado === 'En Progreso' || order.estado_proceso === 'en_proceso') ? 'info' :
                                    (order.estado === 'Pendiente' || order.estado_proceso === 'abierta') ? 'default' :
                                        (order.estado === 'Completado' || order.estado_proceso === 'lista') ? 'success' :
                                            (order.estado === 'Cancelada' || order.estado_proceso === 'cancelada') ? 'danger' :
                                                'warning'
                            } className="px-4 py-1.5">{order.estado || order.estado_proceso}</Badge>
                        </div>
                        <p className="text-slate-500 font-bold flex items-center gap-2 mt-1.5 uppercase tracking-widest text-[10px]">
                            <Calendar size={14} className="text-blue-500" /> Entrega estimada: <span className="text-slate-900">{order.fecha_entrega || 'No definida'}</span>
                        </p>
                    </div>
                </div>
                {renderActionButtons()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Client & Bike Detailed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <User size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Cliente</h2>
                            </div>
                            <div className="space-y-4 relative">
                                <p className="text-lg font-black text-slate-900 leading-none">{order.cliente_nombre || order.cliente?.nombre || 'Cliente V2'}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                                        <Phone size={16} className="text-blue-500" /> {order.cliente_telefono || order.cliente?.telefono || 'Sin teléfono'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                                        <Mail size={16} className="text-blue-500" /> {order.cliente_email || order.cliente?.email || 'Sin email'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Bike size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Bicicleta</h2>
                            </div>
                            <div className="space-y-4 relative">
                                <p className="text-lg font-black text-slate-900 leading-none">{order.bici_modelo || order.bicicleta?.modelo || 'Modelo V2'}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider">
                                        <Layers size={16} className="text-emerald-500" /> {order.bicicleta?.color || 'Color N/A'} • {order.bicicleta?.anio || 'Año N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                                        <Hash size={14} className="text-slate-400" /> S/N: {order.bicicleta?.serial || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details List (Services & Products) */}
                    <Card title="Detalles de la Orden" className="border-0 shadow-xl shadow-slate-200/50">
                        <div className="space-y-6">
                            {/* Servicios */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Wrench size={14} /> Servicios (Mano de Obra)
                                </h3>
                                {servicios.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm italic border border-dashed border-slate-200">
                                        No hay servicios agregados.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {servicios.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                        <Wrench size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{item.descripcion}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mecánico: {order.mecanico?.nombre || 'Asignado'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 w-24 text-right">${item.total_linea.toLocaleString('es-CL')}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Productos */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 mt-6">
                                    <Package size={14} /> Insumos de Taller (APU)
                                </h3>
                                {productos.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm italic border border-dashed border-slate-200">
                                        No hay repuestos agregados.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {productos.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{item.descripcion}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cant: {item.cantidad}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 w-24 text-right">${item.total_linea.toLocaleString('es-CL')}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsAddServiceModalOpen(true)}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                                <PenTool size={16} /> Agregar Servicio
                            </button>
                        </div>
                    </Card>

                    <AddServiceModal
                        isOpen={isAddServiceModalOpen}
                        onClose={() => setIsAddServiceModalOpen(false)}
                        orderId={order.id}
                        onItemAdded={refresh}
                        defaultMechanicId={order.mecanico?.id || order.mecanico_id}
                    />

                    <ConfirmationModal
                        isOpen={isCancelModalOpen}
                        onClose={() => setIsCancelModalOpen(false)}
                        onConfirm={handleCancelOrder}
                        title="¿Anular Orden de Trabajo?"
                        message="¿Estás seguro de que deseas anular esta orden? Podrás reactivarla más tarde si es necesario para agregar más servicios."
                        confirmText="Anular Orden"
                        cancelText="Volver"
                        isDangerous={true}
                    />

                    <ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteOrder}
                        title="¿Eliminar Orden de Trabajo?"
                        message={`¿Estás seguro de que deseas eliminar permanentemente la Orden #${order.id.slice(0, 8)}? Esta acción no se puede deshacer y se borrarán todos los registros asociados.`}
                        confirmText={deleting ? "Eliminando..." : "Sí, Eliminar Permanentemente"}
                        cancelText="No, Mantener Orden"
                        isDangerous={true}
                    />

                    {/* Totals */}
                    <Card title="Resumen Financiero" className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                <span>Total Servicios</span>
                                <span className="text-slate-900">${servicios.reduce((acc, i) => acc + i.total_linea, 0).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                <span>Costo Insumos</span>
                                <span className="text-slate-900">${productos.reduce((acc, i) => acc + i.total_linea, 0).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
                                <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-6">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total a Pagar</span>
                                    <span className="text-xl font-black">${(order.total || 0).toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <Card title="Estado del Trabajo" className="border-0 shadow-xl shadow-slate-200/50">
                        <Timeline items={timelineEvents} />
                    </Card>
                </div>
            </div>
        </div>
    );
};
