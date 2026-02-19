import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import {
    Search, Plus, AlertOctagon,
    Layers, Hammer, Pencil, Trash2
} from 'lucide-react';
import { useServices, type ServiceWithRecipe } from '../hooks/useServices';
import { ServiceModal } from '../components/services/ServiceModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export const Services: React.FC = () => {
    const { services, loading, error, deleteService, refresh } = useServices();
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

    // CRUD State
    const [editingService, setEditingService] = useState<ServiceWithRecipe | null>(null);
    const [deletingService, setDeletingService] = useState<ServiceWithRecipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreate = () => {
        setEditingService(null);
        setIsServiceModalOpen(true);
    };

    const handleEdit = (service: ServiceWithRecipe) => {
        setEditingService(service);
        setIsServiceModalOpen(true);
    };

    const handleDelete = (service: ServiceWithRecipe) => {
        setDeletingService(service);
    };

    const confirmDelete = async () => {
        if (deletingService) {
            const result = await deleteService(deletingService.id);
            if (!result.success) {
                alert(result.error);
            }
            setDeletingService(null);
            refresh();
        }
    };

    const filteredServices = services.filter(service =>
        service.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertOctagon size={48} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar servicios</h2>
                <p className="text-slate-500 mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Catálogo de Servicios</h1>
                    <p className="text-slate-500 font-medium">Mano de obra y recetas APU</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleCreate}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} /> Nuevo Servicio
                    </button>
                </div>
            </div>

            <ServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                initialData={editingService}
            />

            <ConfirmationModal
                isOpen={!!deletingService}
                onClose={() => setDeletingService(null)}
                onConfirm={confirmDelete}
                title="¿Eliminar Servicio?"
                message={`¿Estás seguro de que deseas eliminar el servicio "${deletingService?.nombre}"? Si ha sido utilizado en órdenes pasadas, no se podrá eliminar.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />

            {/* Search */}
            <Card className="border-0 shadow-xl shadow-slate-200/50">
                <div className="mb-6">
                    <Input
                        placeholder="Buscar servicio..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Cargando catálogo...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-medium italic">No se encontraron servicios.</div>
                    ) : (
                        filteredServices.map(service => (
                            <div key={service.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="p-2 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-50 transition-colors border border-blue-100"
                                        title="Editar Servicio"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service)}
                                        className="p-2 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 transition-colors border border-red-100"
                                        title="Eliminar Servicio"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
                                            <Hammer size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{service.nombre}</h3>
                                            <p className="text-sm text-slate-500 mb-3">{service.descripcion || 'Sin descripción'}</p>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="info">
                                                    Comisión: {(service.comision_porcentaje * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900">${service.precio_base.toLocaleString('es-CL')}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Precio Base</p>
                                    </div>
                                </div>

                                {/* Receta APU */}
                                <div className="mt-6 pt-4 border-t border-slate-50">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                        <Layers size={14} /> Insumos Incluidos (APU)
                                    </h4>
                                    {service.receta && service.receta.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {service.receta.map((receta, idx) => (
                                                <span key={idx} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                                                    Item ID: {receta.producto_id.slice(0, 6)}... × {receta.cantidad_sugerida}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Sin insumos configurados.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};
