import React, { useState, useEffect } from 'react';
import { X, User, Save, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClients } from '../../hooks/useClients';
import type { Cliente } from '../../types/database';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Cliente | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, initialData }) => {
    const { perfil } = useAuth();
    const { createClient, updateClient, refresh } = useClients();

    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNombre(initialData.nombre);
                setTelefono(initialData.telefono || '');
                setEmail(initialData.email || '');
                setDireccion(initialData.direccion || '');
            } else {
                setNombre('');
                setTelefono('');
                setEmail('');
                setDireccion('');
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
                result = await updateClient(initialData.id, {
                    nombre: nombre.trim(),
                    telefono: telefono.trim(),
                    email: email.trim(),
                    direccion: direccion.trim()
                });
            } else {
                // Create
                const businessId = perfil?.negocio_id;
                if (!businessId) throw new Error('No se encontró el negocio');

                result = await createClient({
                    business_id: businessId,
                    nombre: nombre.trim(),
                    telefono: telefono.trim(),
                    email: email.trim(),
                    direccion: direccion.trim()
                });
            }

            if (!result.success) throw new Error(result.error);

            refresh();
            onClose();
        } catch (err) {
            console.error('Error saving client:', err);
            alert('Error al guardar cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <User className="text-blue-600" size={24} />
                        {initialData ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                                placeholder="Ej. Ana García"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={e => setTelefono(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="+56 9..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email (Opcional)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="ana@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Dirección (Opcional)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={direccion}
                                onChange={e => setDireccion(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="Av. Providencia 1234..."
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
                            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar Cliente')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
