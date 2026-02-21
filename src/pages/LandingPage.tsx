import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    Bike,
    Store,
    Wrench,
    Package,
    FileText,
    BarChart3,
    Users,
    CheckCircle2,
    ArrowRight,
    HelpCircle,
    Home
} from 'lucide-react';

// Mockup Component to simulate the real Dashboard
const DashboardMockup: React.FC = () => {
    const mockStats = [
        { label: 'Órdenes Activas', value: '12', icon: <Wrench size={18} />, color: 'blue', text: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Ingresos Hoy', value: '$245.000', icon: <BarChart3 size={18} />, color: 'emerald', text: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Bicis en Taller', value: '8', icon: <Bike size={18} />, color: 'indigo', text: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    const mockOrders = [
        { id: 'OT-8032', model: 'Cannondale Scalpel', status: 'En Progreso', client: 'Juan Perez' },
        { id: 'OT-8031', model: 'Trek Top Fuel', status: 'Lista', client: 'Maria Jose' },
        { id: 'OT-8030', model: 'Giant Anthem', status: 'Pendiente', client: 'Carlos R.' },
    ];

    return (
        <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row h-[350px] md:h-[500px] animate-fade-up">
            {/* Sidebar Mock */}
            <div className="w-16 md:w-20 bg-slate-900 flex-col items-center py-6 gap-6 hidden md:flex">
                <div className="bg-lime-400 p-2 rounded-xl mb-4">
                    <Bike size={20} className="text-slate-900" />
                </div>
                {[Home, Users, Wrench, Package, BarChart3, Store].map((Icon, i) => (
                    <div key={i} className={`p-3 rounded-xl transition-colors ${i === 2 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
                        <Icon size={20} />
                    </div>
                ))}
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col">
                {/* Header Mock */}
                <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6">
                    <div className="text-xs md:text-sm font-black text-slate-900">Panel de Control</div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 hidden md:block"></div>
                        <div className="w-20 md:w-24 h-8 rounded-lg bg-slate-100"></div>
                    </div>
                </div>

                {/* Dashboard Grid Mock */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {mockStats.map((stat, i) => (
                            <div key={i} className="p-3 md:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex md:block items-center gap-4 md:gap-0">
                                <div className="flex justify-between items-start md:mb-2">
                                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.text}`}>{stat.icon}</div>
                                    <div className="w-8 h-2 bg-slate-100 rounded-full hidden md:block"></div>
                                </div>
                                <div>
                                    <div className="text-lg md:text-xl font-black text-slate-900">{stat.value}</div>
                                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Table Mock */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Órdenes Activas</span>
                                <div className="w-4 h-4 rounded bg-slate-100"></div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {mockOrders.map((order, i) => (
                                    <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900">{order.model}</span>
                                            <span className="text-[9px] text-slate-400 font-bold">{order.client}</span>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${order.status === 'Lista' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'Pendiente' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Graph Mockup (Simplified) */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ingresos Semanal</div>
                            <div className="flex-1 flex items-end justify-between gap-2">
                                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 rounded-t-md relative group">
                                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-md transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LandingPage: React.FC = () => {
    const { user, perfil } = useAuth();
    const isAuthenticated = user && perfil;

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-lime-200 selection:text-slate-900">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-900 p-2 rounded-lg shadow-lg shadow-slate-900/10">
                            <Bike className="text-lime-400" size={24} />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">Workshop <span className="text-lime-500">Pro</span></span>
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200">Beta</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#caracteristicas" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Características</a>
                        <a href="#equipo" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Equipo</a>
                        <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Preguntas</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-sm font-black text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">Ingresar</Link>
                                <Link
                                    to="/register"
                                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                                >
                                    Unirse a la Beta
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/app"
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Ir al Panel
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-10 md:pb-20 px-4 relative overflow-hidden">
                <div className="absolute top-20 right-0 w-96 h-96 bg-lime-400 rounded-full blur-[120px] opacity-20 -mr-20"></div>
                <div className="absolute bottom-40 left-0 w-72 h-72 bg-blue-500 rounded-full blur-[100px] opacity-10 -ml-20"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm mb-8 animate-fade-up">
                        <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Plan Piloto 2024 Abierto</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        Moderniza tu taller <br className="hidden md:block" />
                        <span className="text-slate-500 underline decoration-lime-400 decoration-8 underline-offset-8 italic">de bicicletas</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        Toma el control total de tu operación: desde la bodega de repuestos hasta el cálculo de comisiones para tus mecánicos. Diseñado por y para especialistas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up mb-16 md:mb-20" style={{ animationDelay: '0.3s' }}>
                        {!isAuthenticated ? (
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                Postular al Plan Piloto
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link
                                to="/app"
                                className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                Ir a mi Dashboard
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                        <a
                            href="#caracteristicas"
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            Ver Módulos
                        </a>
                    </div>

                    {/* Dashboard Realistic Mockup - Desktop & Mobile Friendly */}
                    <div className="max-w-6xl mx-auto relative animate-fade-up" style={{ animationDelay: '0.4s' }}>
                        <div className="bg-slate-900/5 rounded-[32px] md:rounded-[48px] p-2 md:p-6 backdrop-blur-sm border border-white/50 shadow-inner">
                            <DashboardMockup />
                        </div>

                        {/* Floating Micro-interactions for desktop */}
                        <div className="absolute -top-10 -right-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xl hidden lg:flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] text-slate-400 font-black uppercase">Entrega Hoy</div>
                                <div className="text-slate-900 font-black text-sm">Cannondale #8032</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Title */}
            <section id="caracteristicas" className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Módulos especializados</h2>
                        <p className="text-slate-500 font-medium text-lg">Todo lo que necesitas para operar un taller de clase mundial.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1: Bodega */}
                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-lime-200 transition-all hover:shadow-xl hover:shadow-lime-500/5 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-slate-900 transition-colors">
                                <Package className="text-slate-900 group-hover:text-lime-400 transition-colors" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Inventario de insumos</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Control de stock en tiempo real con alertas de reposición automática. Nunca más te quedes sin repuestos críticos.
                            </p>
                            <ul className="mt-6 space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Alertas de mínimo
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Valorización instantánea
                                </li>
                            </ul>
                        </div>

                        {/* Feature 2: Checklist */}
                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-slate-900 transition-colors">
                                <FileText className="text-slate-900 group-hover:text-emerald-400 transition-colors" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Checklist de Recepción</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Documenta el estado exacto en que ingresa la bicicleta con un checklist digital interactivo, protegiendo tu taller ante cualquier reclamo de los clientes.
                            </p>
                            <ul className="mt-6 space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Registro de accesorios dejados
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Fotos y Diagnóstico
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3: Órdenes */}
                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-slate-900/10 transition-all hover:shadow-xl group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-slate-900 transition-colors">
                                <Wrench className="text-slate-900 group-hover:text-white transition-colors" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Flujo de Órdenes</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Gestión visual de reparaciones. Desde la recepción técnica hasta el aviso de retiro por WhatsApp.
                            </p>
                            <ul className="mt-6 space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-slate-900" /> Línea de tiempo real
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-slate-900" /> Fotos y Diagnóstico
                                </li>
                            </ul>
                        </div>

                        {/* Feature 4: Finanzas */}
                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:bg-slate-900 transition-colors">
                                <BarChart3 className="text-slate-900 group-hover:text-emerald-400 transition-colors" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Tablero Financiero</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Balances dinámicos (P&L). Visualiza tus utilidades reales descontando costos de repuestos y equipo.
                            </p>
                            <ul className="mt-6 space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Balance Diario/Mensual
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Arqueo de caja
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="equipo" className="py-24 px-4 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
                <div className="absolute top-1/2 right-0 w-80 h-80 bg-lime-400 rounded-full blur-[140px] opacity-10"></div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div className="inline-block px-4 py-2 bg-lime-400/10 rounded-full border border-lime-400/20">
                            <span className="text-xs font-black uppercase tracking-widest text-lime-400">Gestión de Talento</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                            Tu equipo, <br />
                            <span className="text-lime-400">alineado y motivado.</span>
                        </h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Workshop Pro te permite asignar mecánicos a cada orden y configurar esquemas de comisión transparentes. El equipo sabe cuánto está ganando y tú aseguras la productividad de cada puesto de trabajo.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <Users className="text-lime-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Puestos de Trabajo</h4>
                                    <p className="text-slate-500 text-sm">Gestiona cada estación de trabajo de forma independiente.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <CheckCircle2 className="text-lime-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Comisiones %</h4>
                                    <p className="text-slate-500 text-sm">Cálculo automático según tipo de servicio realizado.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-slate-800 rounded-3xl p-8 border border-white/5 shadow-2xl relative">
                            <div className="absolute -top-10 -right-10 w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-lime-400/20">
                                <span className="text-slate-900 font-black text-xl">+40%</span>
                            </div>
                            <div className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6">Mecánico de Turno</div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center">
                                    <Users className="text-slate-400" size={32} />
                                </div>
                                <div>
                                    <div className="text-white text-xl font-black">Ricardo Cuevas</div>
                                    <div className="text-lime-400 text-sm font-bold">Mecánico Senior</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <span className="text-slate-400 font-bold text-sm">Eficiencia Semanal</span>
                                    <span className="text-white font-black">94%</span>
                                </div>
                                <div className="p-4 bg-lime-400 rounded-2xl flex items-center justify-between shadow-lg shadow-lime-400/10">
                                    <span className="text-slate-900 font-black text-sm uppercase">Comisión Proyectada</span>
                                    <span className="text-slate-900 font-black text-lg">$145.000</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial / Social Proof Placeholder */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-2xl italic font-serif text-slate-700 leading-relaxed mb-8">
                        "Workshop Pro ha cambiado la forma en que entiendo la rentabilidad de mi taller. Antes no sabía cuánto ganaba realmente por orden, ahora tengo los repuestos y mecánicos bajo control."
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <Store className="text-slate-400" size={24} />
                        </div>
                        <div className="text-left">
                            <div className="text-slate-900 font-black text-sm">Rodrigo Cuevas</div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Dueño - BiciFix Performance</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 px-4 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
                            <HelpCircle className="text-blue-500" size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Preguntas Frecuentes</h2>
                        <p className="text-slate-500 font-medium mt-4">Todo lo que necesitas saber sobre el Plan Piloto.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "¿Qué es el Plan Piloto o Acceso Beta?",
                                a: "Es un programa exclusivo para los primeros talleres que adopten la plataforma. Al ser parte del piloto, obtienes beneficios especiales y línea directa con nuestro equipo de desarrollo para solicitar funciones personalizadas."
                            },
                            {
                                q: "¿Cómo se calculan las comisiones de los mecánicos?",
                                a: "Tú defines un porcentaje base de comisión por mano de obra. El sistema separa automáticamente el costo de los repuestos de la mano de obra en cada orden y asigna el monto correspondiente al mecánico asignado."
                            },
                            {
                                q: "¿Qué pasa con mis datos? ¿Están seguros?",
                                a: "Utilizamos una arquitectura multi-inquilino segregada por Row Level Security (RLS). Esto garantiza que los datos de tu taller (clientes, stock, finanzas) sean completamente privados y solo accesibles por ti y tu equipo autorizado."
                            },
                            {
                                q: "¿Necesito ser un experto en computación para usarlo?",
                                a: "Para nada. El sistema está diseñado para dueños de talleres y mecánicos. La interfaz es limpia, intuitiva y funciona perfectamente en tablets al lado del puesto de trabajo."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-help group">
                                <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">{idx + 1}</span>
                                    {item.q}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed pl-11 group-hover:text-slate-600">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400 rounded-full blur-[140px] opacity-10 -mr-40 -mt-40"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500 rounded-full blur-[140px] opacity-10 -ml-30 -mb-30"></div>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 relative z-10 leading-[0.9]">
                        Sé el primer taller en trabajar <br />
                        <span className="text-lime-400">como un profesional de verdad.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-slate-400 text-lg font-medium mb-12 relative z-10">
                        No pierdas más tiempo cuadrando libretas. Automatiza tu taller hoy mismo con Workshop Pro.
                    </p>
                    <div className="relative z-10">
                        <Link
                            to="/register"
                            className="inline-flex px-12 py-6 bg-lime-400 text-slate-900 rounded-3xl font-black text-xl hover:bg-lime-300 transition-all shadow-xl shadow-lime-400/20 active:scale-95 group items-center gap-3"
                        >
                            Solicitar Acceso Beta
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Bike className="text-slate-900" size={24} />
                        <span className="text-xl font-black text-slate-900 tracking-tight">Workshop <span className="text-slate-400">Pro</span></span>
                    </div>

                    <div className="text-slate-400 text-sm font-bold">
                        © 2024 Workshop Pro. Desarrollado para la era moderna del ciclismo. 🚲 Chile.
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Users size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><BarChart3 size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Wrench size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
