import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Bike, Loader2, Lock, Mail, User, Building2, Store } from 'lucide-react';

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState(''); // Nombre del Taller
    const [ownerName, setOwnerName] = useState(''); // Nombre del Dueño
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: ownerName, // Metadata inicial
                    }
                }
            });

            if (authError) throw authError;

            // Note: Triggers in database should handle profile/business creation ideally, 
            // but if we are doing it manually in code (as per implementation plan), we would do it here.
            // For now, relying on the user to check email or basic auth flow.
            // If the SQL trigger "on_auth_user_created" exists and handles it, great. 
            // If not, we might need to insert into 'perfiles' manually if auto-confirm is on.
            // Assuming for now standard email confirmation flow.

            alert('¡Registro iniciado! Por favor verifica tu correo para confirmar la cuenta.');
            navigate('/login');

        } catch (err: any) {
            console.error("Error registering:", err);
            setError(err.message || 'Error al registrar el taller');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>

                    <div className="inline-flex p-4 bg-slate-800 rounded-2xl mb-4 relative z-10">
                        <Store className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight relative z-10">Registra tu Taller</h1>
                    <p className="text-slate-400 font-medium text-sm mt-2 relative z-10">Únete a Workshop Pro hoy</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSignUp} className="space-y-4">

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Taller</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal"
                                    placeholder="Ej: BiciFix Pro"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Tu Nombre</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal"
                                    placeholder="contacto@mitaller.cl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
                                <AlertTriangleIcon />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Cuenta de Taller'}
                        </button>

                        <div className="text-center pt-2">
                            <Link
                                to="/login"
                                className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                ¿Ya tienes cuenta? <span className="underline">Iniciar Sesión</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper icon
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
);
