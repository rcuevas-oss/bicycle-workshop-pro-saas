import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Users, Plus, Wrench, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { useMechanics } from '../hooks/useMechanics';
import { MechanicModal } from '../components/team/MechanicModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { CommissionHistoryModal } from '../components/team/CommissionHistoryModal';
import type { Mecanico } from '../types/database';

export const Commissions: React.FC = () => {
    const { mechanics, loading, error, refresh, deleteMechanic } = useMechanics();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedMechanic, setSelectedMechanic] = useState<Mecanico | null>(null);
    const [editingMechanic, setEditingMechanic] = useState<Mecanico | null>(null);
    const [deletingMechanic, setDeletingMechanic] = useState<Mecanico | null>(null);

    const handleCreate = () => {
        setEditingMechanic(null);
        setIsModalOpen(true);
    };

    const handleEdit = (mechanic: Mecanico) => {
        setEditingMechanic(mechanic);
        setIsModalOpen(true);
    };

    const handleOpenHistory = (mechanic: Mecanico) => {
        setSelectedMechanic(mechanic);
        setIsHistoryOpen(true);
    };

    const handleDelete = (mechanic: Mecanico) => {
        setDeletingMechanic(mechanic);
    };

    const confirmDelete = async () => {
        if (deletingMechanic) {
            await deleteMechanic(deletingMechanic.id);
            setDeletingMechanic(null);
            refresh();
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-red-900 mb-2">Error al cargar equipo</h2>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Equipo</h1>
                    <p className="text-slate-500 font-medium">Administra a tus mecánicos y sus comisiones.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={20} /> Nuevo Mecánico
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-400 font-medium animate-pulse">
                        Cargando equipo...
                    </div>
                ) : mechanics.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Users className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-medium mb-4">No hay mecánicos registrados aún.</p>
                        <button
                            onClick={handleCreate}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Registrar el primero ahora
                        </button>
                    </div>
                ) : (
                    mechanics.map((mechanic) => (
                        <div key={mechanic.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                            {/* Actions Overlay */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={() => handleEdit(mechanic)}
                                    className="p-2 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-50 transition-colors border border-blue-100"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(mechanic)}
                                    className="p-2 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 transition-colors border border-red-100"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="relative flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl shadow-inner">
                                    {mechanic.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{mechanic.nombre}</h3>
                                    <p className="text-sm text-slate-500 font-bold flex items-center gap-1">
                                        <Wrench size={14} /> {mechanic.especialidad || 'General'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                <Badge variant="success" className="px-3">Activo</Badge>
                                <button
                                    onClick={() => handleOpenHistory(mechanic)}
                                    className="text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                    Ver Historial
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <MechanicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMechanicSaved={refresh}
                initialData={editingMechanic}
            />

            {selectedMechanic && (
                <CommissionHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    mechanicId={selectedMechanic.id}
                    mechanicName={selectedMechanic.nombre}
                />
            )}

            <ConfirmationModal
                isOpen={!!deletingMechanic}
                onClose={() => setDeletingMechanic(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar Mecánico?"
                message={`¿Estás seguro de que deseas eliminar a ${deletingMechanic?.nombre}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />
        </div>
    );
};
