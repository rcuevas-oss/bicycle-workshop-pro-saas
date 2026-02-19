import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wrench, Package, Users, Bike, X, Layers, DollarSign } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
        { name: 'Clientes', path: '/clients', icon: <Users size={20} /> },
        { name: 'Taller', path: '/work-orders', icon: <Wrench size={20} /> },
        { name: 'Pañol / Costos', path: '/inventory', icon: <Package size={20} /> },
        { name: 'Catálogo', path: '/services', icon: <Layers size={20} /> },
        { name: 'Equipo', path: '/commissions', icon: <Users size={20} /> },
        { name: 'Finanzas', path: '/finances', icon: <DollarSign size={20} /> },
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
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50
          transform transition-transform duration-300 ease-in-out border-r border-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-lime-400 p-1.5 rounded-lg shadow-lg shadow-lime-400/20">
                            <Bike size={22} className="text-slate-950" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Workshop<span className="text-lime-400">Pro</span></h1>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1.5 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
                        >
                            <span className="transition-transform group-hover:scale-110">
                                {item.icon}
                            </span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Estado Taller</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold">12 Órdenes</span>
                            <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
