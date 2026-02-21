import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Lock, Mail, User, Building2, Store, MapPin, Phone, MailCheck, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState(''); // Nombre del Taller
    const [ownerName, setOwnerName] = useState(''); // Nombre del Dueño
    const [address, setAddress] = useState(''); // Dirección
    const [phonePrefix, setPhonePrefix] = useState('+56'); // Prefijo
    const [phoneNumber, setPhoneNumber] = useState(''); // Número
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, perfil } = useAuth();

    useEffect(() => {
        if (user && perfil) {
            navigate('/app');
        }
    }, [user, perfil, navigate]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up user in Supabase Auth
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: ownerName,
                        business_name: businessName,
                        business_address: address,
                        business_phone: `${phonePrefix}${phoneNumber}`,
                    }
                }
            });

            if (authError) throw authError;

            // Note: Database triggers should handle converting these metadata fields 
            // into 'negocios' and 'perfiles' table rows.

            // Show customized success view instead of alert
            setIsSuccess(true);

        } catch (err) {
            console.error("Error registering:", err);
            setError(err instanceof Error ? err.message : 'Error al registrar el taller');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 overflow-hidden">
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
                    {isSuccess ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 fill-mode-both">
                            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <MailCheck className="text-emerald-600" size={40} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900">¡Registro Exitoso!</h2>
                                <p className="text-slate-500 font-medium">
                                    Hemos enviado un enlace de confirmación a:
                                </p>
                                <p className="text-blue-600 font-bold text-lg bg-blue-50 inline-block px-4 py-1 rounded-full border border-blue-100">
                                    {email}
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-600 font-medium leading-relaxed relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                Por favor, revisa tu <span className="text-slate-900 font-bold">bandeja de entrada</span> (y la carpeta de spam) para activar tu cuenta de taller.
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    Ir al Inicio de Sesión
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : (
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal text-sm"
                                        placeholder="Ej: BiciFix Pro"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Dirección del Taller</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal text-sm"
                                        placeholder="Av. Principal 123, Talca"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Teléfono de contacto</label>
                                <div className="flex gap-2">
                                    <select
                                        value={phonePrefix}
                                        onChange={(e) => setPhonePrefix(e.target.value)}
                                        className="px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="+56">🇨🇱 +56</option>
                                        <option value="+54">🇦🇷 +54</option>
                                        <option value="+51">🇵🇪 +51</option>
                                        <option value="+55">🇧🇷 +55</option>
                                        <option value="+57">🇨🇴 +57</option>
                                        <option value="+52">🇲🇽 +52</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+34">🇪🇸 +34</option>
                                    </select>
                                    <div className="relative flex-1">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal text-sm"
                                            placeholder="9 1234 5678"
                                        />
                                    </div>
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal text-sm"
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal text-sm"
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:font-normal text-sm"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2 font-sans">
                                    <AlertTriangleIcon />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
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
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper icon
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
);
