import React, { useState, useEffect } from 'react';
import { X, Bike, Tag, Palette, Hash, Calendar, Save, Loader2, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClients } from '../../hooks/useClients';
import type { Bicicleta } from '../../types/database';

interface BikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    clientName: string;
    onBikeSaved?: () => void;
    initialData?: Bicicleta | null;
}

export const BikeModal: React.FC<BikeModalProps> = ({
    isOpen,
    onClose,
    clientId,
    clientName,
    onBikeSaved,
    initialData
}) => {
    const { perfil } = useAuth();
    const { updateBike, refresh } = useClients();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        marca: '',
        modelo: '',
        tipo: 'Otra',
        color: '',
        serial: '',
        anio: ''
    });

    // Bike logic handled by useClients hook and local state.

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    marca: initialData.marca || '',
                    modelo: initialData.modelo || '',
                    tipo: initialData.tipo || 'Otra',
                    color: initialData.color || '',
                    serial: initialData.serial || '',
                    anio: initialData.anio ? String(initialData.anio) : ''
                });
            } else {
                setFormData({
                    marca: '',
                    modelo: '',
                    tipo: 'Otra',
                    color: '',
                    serial: '',
                    anio: ''
                });
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

            const bikeData = {
                business_id: businessId,
                cliente_id: clientId,
                marca: formData.marca,
                modelo: formData.modelo,
                tipo: formData.tipo as any,
                color: formData.color || undefined,
                serial: formData.serial || undefined,
                anio: formData.anio || undefined
            };

            const { supabase } = await import('../../lib/supabase'); // Dynamic import to avoid circular dep if any, though not likely here

            let error;
            if (initialData) {
                const result = await updateBike(initialData.id, bikeData);
                if (!result.success) throw new Error(result.error);
            } else {
                const { error: insertError } = await supabase
                    .from('bicicletas')
                    .insert([bikeData]);
                error = insertError;
                if (error) throw error;
            }

            if (onBikeSaved) onBikeSaved();
            refresh();
            onClose();
            alert(initialData ? 'Bicicleta actualizada' : 'Bicicleta registrada');
        } catch (error: any) {
            console.error('Error saving bike:', error);
            alert('Error al guardar bicicleta: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Bike className="text-blue-600" size={24} /> {initialData ? 'Editar Bicicleta' : 'Agregar Bicicleta'}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Para: <span className="text-blue-600">{clientName}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Marca <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                    placeholder="Ej: Trek"
                                    value={formData.marca}
                                    onChange={e => setFormData({ ...formData, marca: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Modelo <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Bike className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                                    placeholder="Ej: Marlin 7"
                                    value={formData.modelo}
                                    onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Bici</label>
                            <div className="relative">
                                <List className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 appearance-none"
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="MTB">MTB (Montaña)</option>
                                    <option value="Ruta">Ruta / Carretera</option>
                                    <option value="Urbana">Urbana / Paseo</option>
                                    <option value="E-Bike">E-Bike (Eléctrica)</option>
                                    <option value="Infantil">Infantil</option>
                                    <option value="Otra">Otra</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Color</label>
                            <div className="relative">
                                <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                    placeholder="Ej: Negro/Verde"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Año</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                    placeholder="Ej: 2023"
                                    value={formData.anio}
                                    onChange={e => setFormData({ ...formData, anio: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nº de Serie / Cuadro</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
                                placeholder="Ej: WTU..."
                                value={formData.serial}
                                onChange={e => setFormData({ ...formData, serial: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Guardar Cambios' : 'Registrar Bicicleta'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
