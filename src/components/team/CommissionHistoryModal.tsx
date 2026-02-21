import React from 'react';
import { X, Search, DollarSign, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useCommissions, type CommissionData } from '../../hooks/useCommissions';
import { Badge } from '../ui/Badge';
import { Loader2 } from 'lucide-react';

interface CommissionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mechanicId: string;
    mechanicName: string;
}

export const CommissionHistoryModal: React.FC<CommissionHistoryModalProps> = ({ isOpen, onClose, mechanicId, mechanicName }) => {
    const { commissions, loading, updateStatus } = useCommissions(mechanicId);

    if (!isOpen) return null;

    const totalPendiente = commissions
        .filter((c: CommissionData) => c.estado === 'pendiente')
        .reduce((acc: number, c: CommissionData) => acc + c.monto, 0);

    const totalPagado = commissions
        .filter((c: CommissionData) => c.estado === 'pagada')
        .reduce((acc: number, c: CommissionData) => acc + c.monto, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-blue-500/20 rounded-xl">
                                <FileText size={20} className="text-blue-300" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Historial de Comisiones</h2>
                        </div>
                        <p className="text-slate-400 font-medium">Historial completo para <span className="text-white font-bold">{mechanicName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 p-3 hover:bg-white/10 rounded-2xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Summary bar */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 border-b border-slate-100">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pendiente de Pago</p>
                        <p className="text-2xl font-black text-amber-600">${totalPendiente.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pagado</p>
                        <p className="text-2xl font-black text-emerald-600">${totalPagado.toLocaleString('es-CL')}</p>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Buscando registros...</p>
                        </div>
                    ) : commissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <Search size={32} className="text-slate-200" />
                            </div>
                            <p className="text-slate-500 font-bold">No se encontraron comisiones registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {commissions.map((commission: CommissionData) => (
                                <div key={commission.id} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-2xl ${commission.estado === 'pagada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 mb-0.5">
                                                {commission.detalle?.descripcion || 'Comisión de Servicio'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(commission.fecha_calculo).toLocaleDateString('es-CL')}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> OT: #{commission.orden?.id.slice(0, 8)}
                                                </span>
                                                <span className="text-xs font-bold text-blue-500">
                                                    Cliente: {commission.orden?.cliente?.nombre || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto self-end sm:self-center">
                                        <div className="text-right mr-2">
                                            <p className="text-lg font-black text-slate-900">${commission.monto.toLocaleString('es-CL')}</p>
                                            <Badge variant={commission.estado === 'pagada' ? 'success' : 'warning'}>
                                                {commission.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                                            </Badge>
                                        </div>

                                        {commission.estado === 'pendiente' && (
                                            <button
                                                onClick={() => updateStatus(commission.id, 'pagada')}
                                                className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                                title="Marcar como pagada"
                                            >
                                                <CheckCircle2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
