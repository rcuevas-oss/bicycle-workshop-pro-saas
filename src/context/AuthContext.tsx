import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Perfil = {
    id: string;
    negocio_id: string;
    rol: 'admin' | 'mecanico' | 'superadmin';
    nombre: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    perfil: Perfil | null;
    loading: boolean;
    signOut: () => Promise<void>;
    authError: string | null;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    perfil: null,
    loading: true,
    signOut: async () => { },
    authError: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);


    useEffect(() => {
        let mounted = true;

        // 1. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth Event:', event, session?.user?.id);

            if (!mounted) return;

            setUser(session?.user ?? null);

            if (session?.user) {
                // Fetch profile whenever session exists OR changes
                await fetchPerfil(session.user.id);
            } else {
                setPerfil(null);
                setLoading(false);
            }
        });

        // 2. Initial manual check (to speed up first paint if session is already there)
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    await fetchPerfil(session.user.id);
                } else {
                    setLoading(false);
                }
            }
        };

        checkInitialSession();

        // Safety Timeout (8s)
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth fallback timeout');
                setLoading(false);
            }
        }, 8000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const fetchPerfil = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                setAuthError(error.message);
                // Fallback: Create temporary profile even on error to allow login
                setPerfil({
                    id: userId,
                    nombre: user?.email?.split('@')[0] || 'Usuario',
                    rol: 'mecanico',
                    email: user?.email || '',
                    negocio_id: ''
                });
            } else if (data) {
                setPerfil(data);
                setAuthError(null);
            } else {
                // No profile found - maybe a new user without a profile row yet
                console.warn('No profile found for user:', userId);
                // We create a minimal volatile profile so the app doesn't crash
                setPerfil({
                    id: userId,
                    nombre: user?.email?.split('@')[0] || 'Usuario',
                    rol: 'mecanico',
                    email: user?.email || '',
                    negocio_id: '' // This will cause issues but allows UI to load
                });
            }
        } catch (err: any) {
            console.error('Unexpected auth error:', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            // We DO NOT manually clear user/profile here.
            // We wait for onAuthStateChange to fire 'SIGNED_OUT' event.
            // This prevents race conditions where the app thinks it's logged out but Supabase client still has token.
        } catch (error) {
            console.error("Error signing out:", error);
            // Verify if we should force clear on error
            setUser(null);
            setPerfil(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, perfil, loading, signOut, authError }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
