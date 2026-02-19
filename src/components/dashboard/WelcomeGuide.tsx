import React from 'react';
import { Package, Hammer, Users, Bike, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WelcomeGuide: React.FC = () => {
    const steps = [
        {
            title: 'Configura tu Inventario',
            description: 'Agrega repuestos e insumos (cámaras, frenos, aceites) con sus precios de venta.',
            icon: <Package className="text-purple-600" size={24} />,
            link: '/inventory',
            label: 'Ir a Inventario',
            color: 'purple'
        },
        {
            title: 'Crea tu Catálogo de Servicios',
            description: 'Define tu mano de obra y crea "Recetas APU" asociando productos del inventario.',
            icon: <Hammer className="text-blue-600" size={24} />,
            link: '/services',
            label: 'Definir Servicios',
            color: 'blue'
        },
        {
            title: 'Registra a tu Equipo',
            description: 'Agrega a tus mecánicos para poder asignarles trabajos y calcular sus comisiones.',
            icon: <Users className="text-emerald-600" size={24} />,
            link: '/commissions',
            label: 'Ver Equipo',
            color: 'emerald'
        },
        {
            title: '¡Recibe tu primera Bicicleta!',
            description: 'Crea una Orden de Trabajo, asigna un mecánico y diagnostica agregando servicios.',
            icon: <Bike className="text-orange-600" size={24} />,
            link: '/work-orders',
            label: 'Abrir Taller',
            color: 'orange'
        }
    ];

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12 border border-slate-700/50">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-[10px] font-black uppercase tracking-widest mb-6">
                    <CheckCircle2 size={14} /> Guía de Configuración Inicial
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                    Bienvenido, Capitán. <span className="text-blue-400">¿Listo para despegar?</span>
                </h2>
                <p className="text-slate-400 font-medium text-lg mb-12 max-w-2xl">
                    Sigue estos pasos para que tu taller fluya como una máquina bien aceitada. Una vez que configures tus precios, el sistema hará el resto por ti.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step, idx) => (
                        <div key={idx} className="group bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-white rounded-2xl shadow-lg">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                            <Link
                                to={step.link}
                                className="inline-flex items-center gap-2 text-sm font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                            >
                                {step.label} <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
