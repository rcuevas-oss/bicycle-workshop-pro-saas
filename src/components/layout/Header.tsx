import { Menu, Search, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { perfil, signOut } = useAuth();
    return (
        <header className="h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between">
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
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button className="hidden sm:flex p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                    <Settings size={20} />
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-2">
                    {perfil && (
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-900 leading-none">{perfil.nombre}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{perfil.rol === 'admin' ? 'Dueño/Gerente' : 'Mecánico'}</p>
                        </div>
                    )}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20 uppercase">
                        {perfil?.nombre.substring(0, 2) || '??'}
                    </div>
                    <button
                        onClick={signOut}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all ml-1"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
