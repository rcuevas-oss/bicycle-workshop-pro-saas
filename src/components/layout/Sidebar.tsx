import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wrench, Package, Users, Bike, X, Layers, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkOrders } from '../../hooks/useWorkOrders';
import type { OrdenTrabajo } from '../../types/database';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    const { orders } = useWorkOrders();
    const activeOrdersCount = orders.filter((o: OrdenTrabajo) =>
        !['pagada', 'entregada', 'cancelada'].includes(o.estado_proceso || '')
    ).length;

    const navItems = [
        { name: 'Dashboard', path: '/app', icon: <Home size={20} /> },
        { name: 'Clientes', path: '/app/clients', icon: <Users size={20} /> },
        { name: 'Taller', path: '/app/work-orders', icon: <Wrench size={20} /> },
        { name: 'Inventario', path: '/app/inventory', icon: <Package size={20} /> },
        { name: 'Catálogo', path: '/app/services', icon: <Layers size={20} /> },
        { name: 'Equipo', path: '/app/commissions', icon: <Users size={20} /> },
        { name: 'Finanzas', path: '/app/finances', icon: <DollarSign size={20} /> },
    ];

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside
                className={`
          fixed top-0 left-0 h-full bg-slate-900 text-white z-50
          transform transition-all duration-300 ease-in-out border-r border-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          print:hidden
        `}
            >
                <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-800 transition-all duration-300`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-lime-400 p-1.5 rounded-lg shadow-lg shadow-lime-400/20 shrink-0">
                            <Bike size={22} className="text-slate-950" />
                        </div>
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                                Workshop<span className="text-lime-400">Pro</span>
                            </h1>
                        )}
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-3 space-y-1.5 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            title={isCollapsed ? item.name : ''}
                            className={({ isActive }) => `
                flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative
                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
                        >
                            <span className={`transition-transform duration-300 ${!isCollapsed && 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span className="whitespace-nowrap overflow-hidden transition-all duration-300 origin-left">
                                    {item.name}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Toggle Button */}
                <button
                    onClick={onToggleCollapse}
                    className="absolute top-20 -right-3 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors hidden lg:flex shadow-sm z-50"
                    title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div className={`absolute bottom-6 left-0 right-0 px-3 transition-all duration-300`}>
                    <div className={`p-4 bg-slate-800/50 rounded-2xl border border-slate-700 transition-all duration-300 ${isCollapsed ? 'flex flex-col items-center p-2 gap-2' : ''}`}>
                        {!isCollapsed && <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Estado Taller</p>}

                        <div className={`flex ${isCollapsed ? 'flex-col-reverse gap-2' : 'justify-between'} items-center w-full`}>
                            {!isCollapsed && <span className="text-sm font-bold truncate">{activeOrdersCount} {activeOrdersCount === 1 ? 'Orden' : 'Órdenes'}</span>}

                            <div className="relative group">
                                <span className={`block w-2 h-2 rounded-full animate-pulse ${activeOrdersCount > 0 ? 'bg-lime-400' : 'bg-slate-500'}`}></span>
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        {activeOrdersCount} Órdenes
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
