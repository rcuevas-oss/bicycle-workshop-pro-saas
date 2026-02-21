import React, { useState, useEffect } from 'react';
import { X, User, Save, Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMechanics } from '../../hooks/useMechanics';
import type { Mecanico } from '../../types/database';

interface MechanicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMechanicSaved: () => void;
    initialData?: Mecanico | null;
}

export const MechanicModal: React.FC<MechanicModalProps> = ({ isOpen, onClose, onMechanicSaved, initialData }) => {
    const { perfil } = useAuth();
    const { createMechanic, updateMechanic } = useMechanics();

    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre);
                setEspecialidad(initialData.especialidad || '');
            } else {
                setNombre('');
                setEspecialidad('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);
        try {
            let result;

            if (initialData) {
                // Update
                result = await updateMechanic(initialData.id, {
                    nombre: nombre.trim(),
                    especialidad: especialidad.trim() || 'General'
                });
            } else {
                // Create
                const businessId = perfil?.negocio_id;
                if (!businessId) throw new Error('No se encontró el negocio');

                result = await createMechanic({
                    business_id: businessId,
                    nombre: nombre.trim(),
                    especialidad: especialidad.trim() || 'General'
                });
            }

            if (!result.success) throw new Error(result.error);

            onMechanicSaved();
            onClose();

        } catch (err) {
            console.error('Error saving mechanic:', err);
            alert('Error al guardar mecánico');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <User className="text-blue-600" size={24} />
                        {initialData ? 'Editar Mecánico' : 'Nuevo Mecánico'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="Ej. Juan Pérez"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Especialidad</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={especialidad}
                                onChange={e => setEspecialidad(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="Ej. Suspensión, Frenos, General..."
                            />
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
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
