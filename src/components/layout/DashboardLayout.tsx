import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { Loader2, RefreshCw } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { perfil } = useAuth();

    // Protection against "Zombie State" (User logged in but Profile/Business not ready)
    if (!perfil) {
        // @ts-ignore
        const { authError, lastAttemptedId, user } = useAuth();

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Configurando tu Taller</h2>
                    <p className="text-slate-500 font-medium mb-8">
                        Estamos terminando de preparar tu entorno de trabajo seguro. Esto solo tomará un momento.
                    </p>

                    {/* DEBUG INFO: Only visible if there is an error */}
                    {authError && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-left text-xs text-red-600 overflow-auto max-h-32">
                            <p className="font-bold mb-1">Diagnóstico:</p>
                            <p>{authError}</p>
                            <p className="mt-1 text-slate-400">ID: {lastAttemptedId || user?.id || '?'}</p>
                        </div>
                    )}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                            <RefreshCw size={18} /> Comprobar nuevamente
                        </button>

                        <button
                            onClick={async () => {
                                console.log('Forcing sign out...');
                                try {
                                    // Try graceful signout first
                                    // @ts-ignore
                                    if (useAuth().signOut) await useAuth().signOut();
                                } catch (e) {
                                    console.error('SignOut failed, forcing manual clear', e);
                                }

                                // FORCE CLEAR EVERYTHING
                                localStorage.clear();
                                sessionStorage.clear();

                                // Hard Redirect
                                window.location.href = '/login';
                            }}
                            className="w-full py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                        >
                            Cerrar Sesión (Forzar Salida)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
