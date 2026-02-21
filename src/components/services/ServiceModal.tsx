

import React, { useState, useEffect } from 'react';
import { X, Hammer, DollarSign, FileText, Save, Loader2, Percent } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import type { ServicioCatalogo } from '../../types/database';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ServicioCatalogo | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, initialData }) => {
    const { perfil } = useAuth();
    const { createService, updateService, refresh } = useServices();
    const [loading, setLoading] = useState(false);

    // Form State
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precioBase, setPrecioBase] = useState('');
    const [comisionPorcentaje, setComisionPorcentaje] = useState('50');
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre);
                setDescripcion(initialData.descripcion || '');
                setPrecioBase(initialData.precio_base.toString());
                setComisionPorcentaje((initialData.comision_porcentaje * 100).toString());
            } else {
                setNombre('');
                setDescripcion('');
                setPrecioBase('');
                setComisionPorcentaje('50');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const businessId = perfil?.negocio_id;
            if (!businessId) {
                throw new Error('No se encontró información del negocio.');
            }

            const comision = Number(comisionPorcentaje) / 100;
            const precio = Number(precioBase) || 0;

            let result;

            if (initialData) {
                // Update
                result = await updateService(initialData.id, {
                    nombre,
                    descripcion: descripcion || undefined,
                    precio_base: precio,
                    comision_porcentaje: comision
                });
            } else {
                // Create
                result = await createService({
                    nombre,
                    descripcion: descripcion || undefined,
                    precio_base: precio,
                    comision_porcentaje: comision,
                    business_id: businessId
                });
            }

            if (!result.success) throw new Error(result.error);

            refresh();
            onClose();
        } catch (error) {
            console.error('Error saving service:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            alert('Error al guardar servicio: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Hammer className="text-blue-600" size={24} />
                        {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Servicio <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Hammer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                    placeholder="Ej: Mantención Full"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Descripción</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3 text-slate-400" size={18} />
                                <textarea
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-none h-24"
                                    placeholder="Detalles de lo que incluye..."
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Precio Cliente ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full pl-12 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
                                        placeholder="0"
                                        value={precioBase}
                                        onChange={e => setPrecioBase(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Comisión Mecánico (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                        placeholder="50"
                                        value={comisionPorcentaje}
                                        onChange={e => setComisionPorcentaje(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center relative overflow-hidden h-12 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className={`flex items-center gap-2 transition-transform duration-300 absolute ${loading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <Loader2 className="animate-spin" size={20} /> Guardando...
                            </span>
                            <span className={`flex items-center gap-2 transition-transform duration-300 ${loading ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                                <Save size={20} /> {initialData ? 'Actualizar' : 'Guardar Servicio'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
