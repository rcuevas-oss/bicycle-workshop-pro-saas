import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Bell, Settings, LogOut, Clock, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWorkOrders } from '../../hooks/useWorkOrders';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { perfil, signOut } = useAuth();
    const navigate = useNavigate();
    const { orders } = useWorkOrders();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get 3 most recent active orders as "notifications"
    const recentActivity = orders.slice(0, 3);

    return (
        <header className="h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu size={22} />
                </button>

                <div className="max-w-md w-full relative hidden sm:block">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar orden, cliente, bici..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') navigate('/work-orders');
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <Bell size={20} />
                        {recentActivity.length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Actividad Reciente</h3>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">Nuevas</span>
                            </div>
                            <div className="space-y-2">
                                {recentActivity.map(order => (
                                    <Link
                                        key={order.id}
                                        to={`/work-orders/${order.id}`}
                                        onClick={() => setShowNotifications(false)}
                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group"
                                    >
                                        <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${order.estado_proceso === 'lista' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {order.estado_proceso === 'lista' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">
                                                {order.cliente_nombre || 'Cliente'} - {order.bici_modelo || 'Bici'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">OT #{order.id.slice(0, 8)} • {order.estado_proceso || 'Abierta'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <button
                                onClick={() => { navigate('/work-orders'); setShowNotifications(false); }}
                                className="w-full mt-4 py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                            >
                                Ver todas las órdenes
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-2 relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all"
                    >
                        {perfil && (
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-bold text-slate-900 leading-none">{perfil.nombre}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{perfil.rol === 'admin' ? 'Dueño/Gerente' : 'Mecánico'}</p>
                            </div>
                        )}
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20 uppercase ring-2 ring-white">
                            {perfil?.nombre?.substring(0, 2) || '??'}
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-3 py-2 border-b border-slate-100 mb-2">
                                <p className="text-sm font-bold text-slate-900 truncate">{perfil?.nombre}</p>
                                <p className="text-xs text-slate-500 truncate">{perfil?.email}</p>
                            </div>
                            <button
                                onClick={() => { navigate('/app/profile'); setShowUserMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                                <User size={18} /> Mi Perfil
                            </button>
                            <button
                                onClick={() => { navigate('/app/settings'); setShowUserMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                                <Settings size={18} /> Configuración
                            </button>
                            <div className="h-px bg-slate-100 my-2"></div>
                            <button
                                onClick={() => { signOut(); setShowUserMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={18} /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
