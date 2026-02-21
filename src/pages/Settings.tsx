import React from 'react';
import { Layers, Users, Building, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { perfil } = useAuth();

    const settingsOptions = [
        {
            title: 'Catálogo de Servicios',
            description: 'Gestiona los precios y descripciones de tus servicios.',
            icon: <Layers size={24} />,
            color: 'bg-blue-50 text-blue-600',
            path: '/services',
            role: ['admin', 'superadmin']
        },
        {
            title: 'Insumos y Costos',
            description: 'Administra el inventario de repuestos y costos operativos.',
            icon: <Building size={24} />,
            color: 'bg-indigo-50 text-indigo-600',
            path: '/inventory',
            role: ['admin', 'superadmin', 'mecanico']
        },
        // Placeholder for future Team Management
        {
            title: 'Gestión de Equipo',
            description: 'Administra usuarios, mecánicos y permisos de acceso.',
            icon: <Users size={24} />,
            color: 'bg-purple-50 text-purple-600',
            path: '/commissions', // Linking to commissions for now as it relates to team
            role: ['admin', 'superadmin']
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configuración</h1>
                <p className="text-slate-500 font-medium">Administra las preferencias y módulos del taller.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingsOptions.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(option.path)}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-2xl ${option.color} group-hover:scale-110 transition-transform`}>
                                {option.icon}
                            </div>
                            <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">{option.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{option.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">Información de la Cuenta</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-600">
                    <p><span className="font-semibold">ID Taller:</span> {perfil?.negocio_id}</p>
                    <span className="hidden sm:inline">•</span>
                    <p><span className="font-semibold">Versión:</span> 1.0.0 (Beta)</p>
                </div>
            </div>
        </div>
    );
};
