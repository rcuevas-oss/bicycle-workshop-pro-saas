import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import {
    Users, Search, Plus, Bike,
    Phone, Mail, ChevronDown, ChevronUp, AlertOctagon,
    Pencil, Trash2
} from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { ClientModal } from '../components/clients/ClientModal';
import { BikeModal } from '../components/clients/BikeModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import type { Cliente, Bicicleta } from '../types/database';

export const Clients: React.FC = () => {
    const { clients, loading, error, deleteClient, deleteBike, refresh } = useClients();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isBikeModalOpen, setIsBikeModalOpen] = useState(false);
    const [selectedClientForBike, setSelectedClientForBike] = useState<{ id: string, nombre: string } | null>(null);

    // CRUD State
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [deletingClient, setDeletingClient] = useState<Cliente | null>(null);
    const [editingBike, setEditingBike] = useState<Bicicleta | null>(null);
    const [deletingBike, setDeletingBike] = useState<Bicicleta | null>(null);

    const filteredClients = clients.filter(client =>
        client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telefono?.includes(searchTerm)
    );

    const toggleExpand = (id: string) => {
        setExpandedClientId(expandedClientId === id ? null : id);
    };

    const handleCreateClient = () => {
        setEditingClient(null);
        setIsClientModalOpen(true);
    };

    const handleEditClient = (client: Cliente) => {
        setEditingClient(client);
        setIsClientModalOpen(true);
    };

    const handleDeleteClient = (client: Cliente) => {
        setDeletingClient(client);
    };

    const confirmDeleteClient = async () => {
        if (deletingClient) {
            const result = await deleteClient(deletingClient.id);
            if (!result.success) {
                alert(result.error);
            }
            setDeletingClient(null);
            refresh();
        }
    };

    const handleCreateBike = (client: Cliente) => {
        setEditingBike(null);
        setSelectedClientForBike({ id: client.id, nombre: client.nombre });
        setIsBikeModalOpen(true);
    };

    const handleEditBike = (client: Cliente, bike: Bicicleta) => {
        setEditingBike(bike);
        setSelectedClientForBike({ id: client.id, nombre: client.nombre });
        setIsBikeModalOpen(true);
    };

    const handleDeleteBike = (bike: Bicicleta) => {
        setDeletingBike(bike);
    };

    const confirmDeleteBike = async () => {
        if (deletingBike) {
            const result = await deleteBike(deletingBike.id);
            if (!result.success) {
                alert(result.error);
            }
            setDeletingBike(null);
            refresh();
        }
    };

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertOctagon size={48} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar clientes</h2>
                <p className="text-slate-500 mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clientes</h1>
                    <p className="text-slate-500 font-medium">Base de datos de usuarios y bicicletas</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleCreateClient}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} /> Nuevo Cliente
                    </button>
                </div>
            </div>

            <ClientModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                initialData={editingClient}
            />

            <ConfirmationModal
                isOpen={!!deletingClient}
                onClose={() => setDeletingClient(null)}
                onConfirm={confirmDeleteClient}
                title="¿Eliminar Cliente?"
                message={`¿Estás seguro de que deseas eliminar a ${deletingClient?.nombre}? Si tiene bicicletas u órdenes asociadas, no se podrá eliminar.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />

            <ConfirmationModal
                isOpen={!!deletingBike}
                onClose={() => setDeletingBike(null)}
                onConfirm={confirmDeleteBike}
                title="¿Eliminar Bicicleta?"
                message={`¿Estás seguro de que deseas eliminar esta ${deletingBike?.marca} ${deletingBike?.modelo}? Esta acción no se puede deshacer si tiene órdenes de trabajo.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />

            {selectedClientForBike && (
                <BikeModal
                    isOpen={isBikeModalOpen}
                    onClose={() => {
                        setIsBikeModalOpen(false);
                        setSelectedClientForBike(null);
                        setEditingBike(null);
                    }}
                    clientId={selectedClientForBike.id}
                    clientName={selectedClientForBike.nombre}
                    initialData={editingBike}
                    onBikeSaved={() => refresh()}
                />
            )}

            {/* Search & List */}
            <Card className="border-0 shadow-xl shadow-slate-200/50">
                <div className="mb-6">
                    <Input
                        placeholder="Buscar por nombre, email o teléfono..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Cargando clientes...</div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-medium italic">No se encontraron clientes.</div>
                    ) : (
                        filteredClients.map(client => (
                            <div key={client.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                {/* User Row */}
                                <div
                                    className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    onClick={() => toggleExpand(client.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">{client.nombre}</h3>
                                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500 font-medium">
                                                {client.telefono && (
                                                    <span className="flex items-center gap-1"><Phone size={14} /> {client.telefono}</span>
                                                )}
                                                {client.email && (
                                                    <span className="flex items-center gap-1"><Mail size={14} /> {client.email}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 self-end md:self-center">
                                        {/* Actions */}
                                        <div className="flex items-center gap-1 mr-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                                title="Editar Cliente"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClient(client); }}
                                                className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                                title="Eliminar Cliente"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <Badge variant="default" className="flex items-center gap-1">
                                            <Bike size={14} /> {client.bicicletas?.length || 0} Bicis
                                        </Badge>
                                        <button className="text-slate-400">
                                            {expandedClientId === client.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Bikes Expansion */}
                                {expandedClientId === client.id && (
                                    <div className="bg-slate-50/50 p-6 border-t border-slate-100 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Bike size={14} /> Garaje
                                            </h4>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCreateBike(client);
                                                }}
                                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={12} /> Agregar Bici
                                            </button>
                                        </div>

                                        {client.bicicletas && client.bicicletas.length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {client.bicicletas.map(bici => (
                                                    <div key={bici.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group/bike">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-slate-800">{bici.modelo}</p>
                                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{bici.marca} • {bici.color}</p>
                                                            {bici.serial && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono mt-1 inline-block">S/N: {bici.serial}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/bike:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditBike(client, bici)}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Editar Bici"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBike(bici)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Eliminar Bici"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-slate-400 text-sm italic">
                                                Este cliente no tiene bicicletas registradas.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};
