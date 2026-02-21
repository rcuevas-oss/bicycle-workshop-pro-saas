import { X, Search, User, Bike, ChevronRight, CheckCircle2, ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useClients, type ClientWithBikes } from '../../hooks/useClients';
import { useMechanics } from '../../hooks/useMechanics';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BikeModal } from '../clients/BikeModal';
import { MechanicModal } from '../team/MechanicModal';
import { ChecklistRecepcion, type ChecklistData } from './ChecklistRecepcion';
import type { Json } from '../../types/database';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { perfil } = useAuth();
    const { clients, loading: loadingClients, refresh: refreshClients } = useClients();
    const { mechanics, loading: loadingMechanics, refresh: refreshMechanics } = useMechanics();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientWithBikes | null>(null);
    const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
    const [selectedMechanicId, setSelectedMechanicId] = useState<string | null>(null);
    const [checklistData, setChecklistData] = useState<ChecklistData | undefined>(undefined);
    const [creating, setCreating] = useState(false);
    const [isBikeModalOpen, setIsBikeModalOpen] = useState(false);
    const [isMechanicModalOpen, setIsMechanicModalOpen] = useState(false);

    if (!isOpen) return null;

    const filteredClients = clients.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefono?.includes(searchTerm)
    );

    const handleClientSelect = (client: ClientWithBikes) => {
        setSelectedClient(client);
        setStep(2);
    };

    const handleCreateOrder = async () => {
        if (!selectedClient || !selectedBikeId || !selectedMechanicId) return;

        try {
            const businessId = perfil?.negocio_id;
            if (!businessId) {
                throw new Error('No se encontró información del negocio.');
            }

            setCreating(true);

            const { data, error } = await supabase
                .from('ordenes_trabajo')
                .insert({
                    business_id: businessId,
                    cliente_id: selectedClient.id,
                    bicicleta_id: selectedBikeId,
                    mecanico_id: selectedMechanicId,
                    estado: 'Pendiente', // Legacy
                    estado_proceso: 'abierta',
                    total: 0,
                    checklist_recepcion: checklistData as unknown as Json // Stored as JSONB
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                onClose();
                navigate(`/app/work-orders/${data.id}`);
            }

        } catch (err) {
            console.error("Error creating order:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            alert(`Error al crear la orden: ${errorMessage}`);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Nueva Orden de Trabajo</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${step === 2 ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>2. Bicicleta</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${step === 3 ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>3. Mecánico</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${step === 4 ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>4. Checklist</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o teléfono..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-2">
                                {loadingClients ? (
                                    <div className="py-8 text-center text-slate-400 animate-pulse">Cargando clientes...</div>
                                ) : filteredClients.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 italic">No se encontraron clientes.</div>
                                ) : (
                                    filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleClientSelect(client)}
                                            className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 text-slate-500 rounded-full group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{client.nombre}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{client.telefono || 'Sin teléfono'}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {(step === 2 || step === 3 || step === 4) && selectedClient && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Cliente Seleccionado</p>
                                    <h3 className="font-bold text-slate-900">{selectedClient.nombre}</h3>
                                </div>
                                <button onClick={() => setStep(1)} className="ml-auto text-xs font-bold text-blue-600 hover:underline">Cambiar</button>
                            </div>

                            {(step === 3 || step === 4) && selectedBikeId && (
                                <div className="flex items-center gap-3 p-4 bg-lime-50/50 border border-lime-100 rounded-xl">
                                    <div className="p-2 bg-lime-100 text-lime-700 rounded-full">
                                        <Bike size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-lime-600 uppercase tracking-widest">Bicicleta Seleccionada</p>
                                        <h3 className="font-bold text-slate-900">
                                            {selectedClient.bicicletas?.find(b => b.id === selectedBikeId)?.modelo}
                                        </h3>
                                    </div>
                                    <button onClick={() => setStep(2)} className="ml-auto text-xs font-bold text-blue-600 hover:underline">Cambiar</button>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Bike size={20} className="text-slate-400" />
                                        Seleccionar Bicicleta
                                    </h3>

                                    {(!selectedClient.bicicletas || selectedClient.bicicletas.length === 0) ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <p className="text-slate-500 mb-2">Este cliente no tiene bicicletas registradas.</p>
                                            <button
                                                onClick={() => setIsBikeModalOpen(true)}
                                                className="text-sm font-bold text-blue-600 hover:underline"
                                            >
                                                + Registrar Bicicleta Ahora
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {selectedClient.bicicletas.map(bike => (
                                                <button
                                                    key={bike.id}
                                                    onClick={() => {
                                                        setSelectedBikeId(bike.id);
                                                        setStep(3);
                                                    }}
                                                    className={`
                                                    relative flex items-center justify-between p-4 border rounded-xl transition-all
                                                    ${selectedBikeId === bike.id
                                                            ? 'bg-lime-50 border-lime-500 shadow-md transform scale-[1.02]'
                                                            : 'bg-white border-slate-100 hover:border-slate-300'}
                                                `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                        p-2 rounded-lg 
                                                        ${selectedBikeId === bike.id ? 'bg-lime-200 text-lime-800' : 'bg-slate-100 text-slate-500'}
                                                    `}>
                                                            <Bike size={24} />
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="font-black text-slate-900">{bike.modelo}</h4>
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                                <span className="text-blue-600">{bike.tipo || 'Otra'}</span> • {bike.marca} • {bike.color}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedBikeId === bike.id && (
                                                        <div className="absolute top-3 right-3 text-lime-600">
                                                            <CheckCircle2 size={24} className="fill-lime-100" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 4 && selectedMechanicId && (
                                <div className="flex items-center gap-3 p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
                                    <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Mecánico Asignado</p>
                                        <h3 className="font-bold text-slate-900">
                                            {mechanics.find(m => m.id === selectedMechanicId)?.nombre}
                                        </h3>
                                    </div>
                                    <button onClick={() => setStep(3)} className="ml-auto text-xs font-bold text-blue-600 hover:underline">Cambiar</button>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ClipboardCheck size={20} className="text-slate-600" />
                                            <h3 className="font-bold text-slate-900">Checklist de Recepción</h3>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <ChecklistRecepcion
                                            value={checklistData}
                                            onChange={setChecklistData}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <User size={20} className="text-slate-400" />
                                Asignar Mecánico Responsable
                            </h3>

                            <div className="grid gap-3">
                                {loadingMechanics ? (
                                    <div className="py-8 text-center text-slate-400 animate-pulse">Cargando mecánicos...</div>
                                ) : mechanics.length === 0 ? (
                                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-500 mb-2 font-medium">No hay mecánicos registrados.</p>
                                        <button
                                            onClick={() => setIsMechanicModalOpen(true)}
                                            className="text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto"
                                        >
                                            + Registrar Mecánico
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {mechanics.map(mechanic => (
                                            <button
                                                key={mechanic.id}
                                                onClick={() => setSelectedMechanicId(mechanic.id)}
                                                className={`
                                                flex items-center justify-between p-4 border rounded-xl transition-all
                                                ${selectedMechanicId === mechanic.id
                                                        ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]'
                                                        : 'bg-white border-slate-100 hover:border-slate-300'}
                                            `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${selectedMechanicId === mechanic.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                                                        <User size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-900">{mechanic.nombre}</span>
                                                </div>
                                                {selectedMechanicId === mechanic.id && <CheckCircle2 className="text-blue-600" size={20} />}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setIsMechanicModalOpen(true)}
                                            className="w-full py-3 mt-4 text-sm font-bold text-slate-400 hover:text-blue-600 border border-dashed border-slate-200 hover:border-blue-300 rounded-xl transition-all flex justify-center items-center gap-2"
                                        >
                                            + Nuevo Mecánico
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    {(step === 2 || step === 3 || step === 4) && (
                        <button
                            onClick={() => setStep(step === 4 ? 3 : step === 3 ? 2 : 1)}
                            className="text-sm font-bold text-slate-500 hover:text-slate-800"
                        >
                            Atrás
                        </button>
                    )}
                    <div className="ml-auto">
                        {step === 3 && selectedMechanicId && (
                            <button
                                onClick={() => setStep(4)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                Siguiente
                                <ArrowRight size={18} />
                            </button>
                        )}
                        {step === 4 && selectedMechanicId && (
                            <button
                                onClick={handleCreateOrder}
                                disabled={creating}
                                className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden h-12 w-44"
                            >
                                <span className={`flex items-center gap-2 transition-transform duration-300 absolute ${creating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <Loader2 className="animate-spin" size={18} /> Creando...
                                </span>
                                <span className={`flex items-center gap-2 transition-transform duration-300 ${creating ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                                    Crear Orden <ArrowRight size={18} />
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {selectedClient && (
                    <BikeModal
                        isOpen={isBikeModalOpen}
                        onClose={() => setIsBikeModalOpen(false)}
                        clientId={selectedClient.id}
                        clientName={selectedClient.nombre}
                        onBikeSaved={() => {
                            refreshClients();
                        }}
                    />
                )}

                <MechanicModal
                    isOpen={isMechanicModalOpen}
                    onClose={() => setIsMechanicModalOpen(false)}
                    onMechanicSaved={() => {
                        refreshMechanics();
                    }}
                />
            </div>
        </div>
    );
};
