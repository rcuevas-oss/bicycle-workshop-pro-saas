import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useWorkOrderDetail } from '../hooks/useWorkOrderDetail';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Timeline, type TimelineItem } from '../components/ui/Timeline';
import { AddServiceModal } from '../components/work-orders/AddServiceModal';
import { ChecklistRecepcion, type ChecklistData } from '../components/work-orders/ChecklistRecepcion';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import {
    ArrowLeft, User, Bike, Calendar, Phone, Mail, Hash,
    PenTool, Layers, Loader2, AlertTriangle, Package,
    Wrench, CheckCircle2, Trash2, Printer, DollarSign
} from 'lucide-react';

export const WorkOrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { order, details, loading, error, refresh } = useWorkOrderDetail(id);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = React.useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [processingPayment, setProcessingPayment] = React.useState(false);


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
                    to="/app/work-orders"
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 inline-block"
                >
                    Volver al Panel
                </Link>
            </div>
        );
    }

    const getTimelineEvents = (): TimelineItem[] => {
        if (!order) return [];
        const events: TimelineItem[] = [
            { id: '1', title: 'Orden Creada', description: 'Recepcionado en sistema', time: order.creado_en ? new Date(order.creado_en).toLocaleString('es-CL') : 'N/A', type: 'start' as const },
        ];

        const status = order.estado_proceso || 'abierta';

        if (status === 'en_proceso' || status === 'lista' || status === 'entregada' || status === 'pagada') {
            events.push({ id: '2', title: 'En Taller', description: 'El trabajo ha comenzado', time: '', type: 'info' as const });
        }

        if (status === 'lista' || status === 'entregada' || status === 'pagada') {
            events.push({ id: '3', title: 'Trabajo Finalizado', description: 'Listo para retiro', time: '', type: 'success' as const });
        }

        if (status === 'entregada' || status === 'pagada') {
            events.push({ id: '4', title: 'Entregada', description: 'Bicicleta entregada al cliente', time: '', type: 'info' as const });
        }

        if (status === 'pagada') {
            events.push({ id: '5', title: 'Pagada', description: 'Orden cerrada y cobrada', time: '', type: 'success' as const });
        }

        if (status === 'cancelada') {
            events.push({ id: '6', title: 'Anulada', description: 'La orden fue cancelada', time: '', type: 'warning' as const });
        }

        return events;
    };

    const timelineEvents = getTimelineEvents();

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

    const handlePayment = () => {
        if (!order?.id) {
            alert("Error: No se encontró el ID de la orden.");
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const confirmPayment = async () => {
        setIsPaymentModalOpen(false);

        setProcessingPayment(true);
        try {
            // 1. Data Validation
            if (!order.business_id) {
                throw new Error("ID de negocio faltante en la orden.");
            }

            // 2. Generate Commissions Snapshot
            const commissionItems = details.filter(d => Number(d.comision_monto) > 0 && d.mecanico_id);

            if (commissionItems.length > 0) {
                const commissionsToInsert = commissionItems.map(item => ({
                    business_id: order.business_id,
                    mecanico_id: item.mecanico_id,
                    orden_id: order.id,
                    ot_detalle_id: item.id,
                    monto: Number(item.comision_monto) || 0,
                    estado: 'pendiente'
                }));

                const { error: commError } = await supabase
                    .from('comisiones')
                    .insert(commissionsToInsert);

                if (commError) {
                    console.error("Commission Error Details:", commError);
                    throw new Error(`Error al generar comisiones: ${commError.message}`);
                }
            }

            // 3. Update Status to Paid
            const { error: updateError } = await supabase
                .from('ordenes_trabajo')
                .update({
                    estado_proceso: 'pagada',
                    estado: 'Pagada',
                    pagado_en: new Date().toISOString()
                })
                .eq('id', order.id);

            if (updateError) {
                console.error("Update Order Error Details:", updateError);
                throw new Error(`Error al actualizar estado de la orden: ${updateError.message}`);
            }

            // SUCCESS!
            await refresh();
            alert("¡Pago registrado con éxito!");

        } catch (err) {
            console.error("Full Error processing payment:", err);
            alert("❌ ERROR AL REGISTRAR PAGO:\n" + (err instanceof Error ? err.message : "Error desconocido"));
        } finally {
            setProcessingPayment(false);
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

            navigate('/app/work-orders');
        } catch (err) {
            console.error("Error deleting order:", err);
            alert("Error al eliminar la orden: " + (err instanceof Error ? err.message : String(err)));
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
                        disabled={processingPayment}
                        className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center relative overflow-hidden h-12"
                    >
                        <span className={`flex items-center gap-2 transition-transform duration-300 absolute ${processingPayment ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <Loader2 size={18} className="animate-spin" /> Procesando...
                        </span>
                        <span className={`flex items-center gap-2 transition-transform duration-300 ${processingPayment ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                            <DollarSign size={18} /> Registrar Pago ($)
                        </span>
                    </button>
                )}

                {(status === 'abierta' || status === 'en_proceso') && (
                    <button
                        onClick={() => handleStatusUpdate('lista')}
                        className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center h-12"
                    >
                        <span>Finalizar Trabajo</span>
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

    /**
     * Header para Impresión (Solo visible al imprimir)
     */
    const PrintHeader = () => (
        <div className="hidden print:block mb-8 border-b border-black pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider mb-2">Orden de Trabajo</h1>
                    <p className="text-xl text-black font-bold">#{order?.id?.slice(0, 8) || 'N/A'}</p>
                    <div className="mt-4 text-sm text-black space-y-1">
                        <p><strong>Fecha Recepción:</strong> {order?.creado_en ? new Date(order.creado_en).toLocaleDateString('es-CL') : 'N/A'}</p>
                        <p><strong>Fecha Entrega Est.:</strong> {order?.fecha_entrega || 'Por definir'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                        <Bike size={24} className="text-black" />
                        <span className="text-xl font-bold text-black">WorkshopPro</span>
                    </div>
                    <p className="text-sm text-black">Taller Profesional de Bicicletas</p>
                    <p className="text-sm text-black">contacto@workshoppro.cl</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 print:space-y-4 print:animate-none">
            <PrintHeader />

            {/* Header (Hidden on Print) */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 print:hidden">
                <div className="flex items-center gap-5">
                    <Link to="/app/work-orders" className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orden #{order?.id?.slice(0, 8) || 'N/A'}</h1>
                            <Badge variant={
                                (order?.estado === 'En Progreso' || order?.estado_proceso === 'en_proceso') ? 'info' :
                                    (order?.estado === 'Pendiente' || order?.estado_proceso === 'abierta') ? 'default' :
                                        (order?.estado === 'Completado' || order?.estado_proceso === 'lista') ? 'success' :
                                            (order?.estado === 'Cancelada' || order?.estado_proceso === 'cancelada') ? 'danger' :
                                                'warning'
                            } className="px-4 py-1.5">{order?.estado || order?.estado_proceso}</Badge>
                        </div>
                        <p className="text-slate-500 font-bold flex items-center gap-2 mt-1.5 uppercase tracking-widest text-[10px]">
                            <Calendar size={14} className="text-blue-500" /> Entrega estimada: <span className="text-slate-900">{order?.fecha_entrega || 'No definida'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                        title="Imprimir Orden / Comanda"
                    >
                        <Printer size={22} />
                    </button>
                    {renderActionButtons()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8 print:w-full">
                    {/* Client & Bike Detailed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group print:shadow-none print:border print:border-black print:rounded-none print:p-4">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 print:hidden"></div>
                            <div className="flex items-center gap-4 mb-6 relative print:mb-2">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl print:hidden">
                                    <User size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight print:text-black print:text-lg">Cliente</h2>
                            </div>
                            <div className="space-y-4 relative print:space-y-1">
                                <p className="text-lg font-black text-slate-900 leading-none print:text-black">{order?.cliente?.nombre || order?.bicicleta?.cliente?.nombre || order?.cliente_nombre || 'Cliente V2'}</p>
                                <div className="grid grid-cols-1 gap-3 print:gap-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold print:text-black">
                                        <Phone size={16} className="text-blue-500 print:hidden" /> {order?.cliente_telefono || order?.cliente?.telefono || 'Sin teléfono'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold print:text-black">
                                        <Mail size={16} className="text-blue-500 print:hidden" /> {order?.cliente_email || order?.cliente?.email || 'Sin email'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group print:shadow-none print:border print:border-black print:rounded-none print:p-4">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 print:hidden"></div>
                            <div className="flex items-center gap-4 mb-6 relative print:mb-2">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl print:hidden">
                                    <Bike size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight print:text-black print:text-lg">Bicicleta</h2>
                            </div>
                            <div className="space-y-4 relative print:space-y-1">
                                <p className="text-lg font-black text-slate-900 leading-none print:text-black">{order?.bici_modelo || order?.bicicleta?.modelo || 'Modelo V2'}</p>
                                <div className="grid grid-cols-1 gap-3 print:gap-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider print:text-black">
                                        <Layers size={16} className="text-emerald-500 print:hidden" /> {order?.bicicleta?.color || 'Color N/A'} • {order?.bicicleta?.anio || 'Año N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg w-fit print:bg-transparent print:p-0 print:text-black">
                                        <Hash size={14} className="text-slate-400 print:hidden" /> S/N: {order?.bicicleta?.serial || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Recepción */}
                    {order?.checklist_recepcion && (
                        <Card title="Checklist de Recepción" className="border-0 shadow-xl shadow-slate-200/50 print:shadow-none print:border print:border-black print:rounded-none">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <ChecklistRecepcion
                                    value={order.checklist_recepcion as unknown as ChecklistData}
                                    readOnly={true}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Details List (Services & Products) */}
                    <Card title="Detalles de la Orden" className="border-0 shadow-xl shadow-slate-200/50 print:shadow-none print:border print:border-black print:rounded-none">
                        <div className="space-y-6 print:space-y-4">
                            {/* Servicios */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 print:text-black print:border-b print:border-black print:pb-1">
                                    <Wrench size={14} /> Servicios (Mano de Obra)
                                </h3>
                                {servicios.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm italic border border-dashed border-slate-200">
                                        No hay servicios agregados.
                                    </div>
                                ) : (
                                    <div className="grid gap-3 print:gap-0">
                                        {servicios.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm print:rounded-none print:shadow-none print:border-0 print:border-b print:border-slate-200 print:py-2 print:px-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl print:hidden">
                                                        <Wrench size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 print:text-black">{item.descripcion}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-slate-600">Mecánico: {order.mecanico?.nombre || 'Asignado'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 w-24 text-right print:text-black">${(item?.total_linea || 0).toLocaleString('es-CL')}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Productos */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 mt-6 print:text-black print:border-b print:border-black print:pb-1 print:mt-4">
                                    <Package size={14} /> Repuestos y Accesorios
                                </h3>
                                {productos.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm italic border border-dashed border-slate-200">
                                        No hay repuestos agregados.
                                    </div>
                                ) : (
                                    <div className="grid gap-3 print:gap-0">
                                        {productos.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm print:rounded-none print:shadow-none print:border-0 print:border-b print:border-slate-200 print:py-2 print:px-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl print:hidden">
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 print:text-black">{item.descripcion}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider print:text-slate-600">Cant: {item.cantidad}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 w-24 text-right print:text-black">${(item?.total_linea || 0).toLocaleString('es-CL')}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsAddServiceModalOpen(true)}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 print:hidden"
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
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        onConfirm={confirmPayment}
                        title="Confirmar Pago"
                        message="¿Confirmar pago y cerrar orden? Esto generará las comisiones de los mecánicos y marcará la orden como Pagada."
                        confirmText={processingPayment ? "Procesando..." : "Registrar Pago"}
                        cancelText="Volver"
                        isDangerous={false}
                    />

                    <ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteOrder}
                        title="¿Eliminar Orden de Trabajo?"
                        message={`¿Estás seguro de que deseas eliminar permanentemente la Orden #${order?.id?.slice(0, 8) || 'N/A'}? Esta acción no se puede deshacer y se borrarán todos los registros asociados.`}
                        confirmText={deleting ? "Eliminando..." : "Sí, Eliminar Permanentemente"}
                        cancelText="No, Mantener Orden"
                        isDangerous={true}
                    />

                    {/* Totals */}
                    <Card title="Resumen Financiero" className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden print:shadow-none print:border print:border-black print:rounded-none">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 print:text-black">
                                <span>Total Servicios</span>
                                <span className="text-slate-900 print:text-black">${servicios.reduce((acc, i) => acc + (i?.total_linea || 0), 0).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 print:text-black">
                                <span>Costo Repuestos</span>
                                <span className="text-slate-900 print:text-black">${productos.reduce((acc, i) => acc + (i?.total_linea || 0), 0).toLocaleString('es-CL')}</span>
                            </div>
                            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end print:border-black">
                                <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-6 print:bg-white print:text-black print:shadow-none print:border print:border-black print:px-4 print:py-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 print:text-black">Total a Pagar</span>
                                    <span className="text-xl font-black">${(order?.total || 0).toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Signature / Legal (Print Only) */}
                    <div className="hidden print:block mt-24 pt-8 border-t border-black">
                        <div className="grid grid-cols-2 gap-12">
                            <div className="text-center">
                                <div className="h-16 border-b border-black mb-2"></div>
                                <p className="text-sm font-bold text-black uppercase">Firma Taller</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 border-b border-black mb-2"></div>
                                <p className="text-sm font-bold text-black uppercase">Firma Cliente</p>
                            </div>
                        </div>
                        <p className="text-xs text-center mt-8 text-slate-600">Al firmar, el cliente acepta los términos y condiciones del servicio. La bicicleta se entrega en las condiciones descritas.</p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8 print:hidden">
                    <Card title="Estado del Trabajo" className="border-0 shadow-xl shadow-slate-200/50">
                        <Timeline items={timelineEvents} />
                    </Card>
                </div>
            </div>
        </div>
    );
};
