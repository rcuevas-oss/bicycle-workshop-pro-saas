import React, { createContext, useEffect, useState } from 'react';
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

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
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

    const fetchPerfil = async (userId: string, userEmail?: string) => {
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
                    nombre: userEmail?.split('@')[0] || 'Usuario',
                    rol: 'mecanico',
                    email: userEmail || '',
                    negocio_id: ''
                });
            } else if (data) {
                setPerfil(data);
                setAuthError(null);
            } else {
                // No profile found - user exists in Auth but not in our 'perfiles' table
                console.warn('No profile found for user:', userId);
                setPerfil(null);
            }
        } catch (err) {
            console.error('Unexpected auth error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        // 1. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth Event:', event, session?.user?.id);

            if (!mounted) return;
            setUser(session?.user ?? null);
            setLoading(false); // Stop blocking as soon as we know IF there is a user

            if (session?.user) {
                fetchPerfil(session.user.id, session.user.email);
            } else {
                setPerfil(null);
            }
        });

        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setUser(session?.user ?? null);
                setLoading(false); // Stop blocking
                if (session?.user) {
                    fetchPerfil(session.user.id, session.user.email);
                } else {
                    setPerfil(null); // Set perfil to null if no session user
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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


