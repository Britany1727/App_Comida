import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '../api/supabase';

type AuthContextValue = {
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<string | null>;
    signUp: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<string | null>;
    };

    const AuthContext = createContext<AuthContextValue | undefined>(undefined);

    export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data, error }) => {
        if (!mounted) {
            return;
        }

        if (error) {
            setSession(null);
        } else {
            setSession(data.session);
        }

        setIsLoading(false);
        });

        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setIsLoading(false);
        });

        return () => {
        mounted = false;
        data.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error?.message ?? null;
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return error?.message ?? null;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return error?.message ?? null;
    };

    return (
        <AuthContext.Provider value={{ session, isLoading, signIn, signUp, signOut }}>
        {children}
        </AuthContext.Provider>
    );
    }

    export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }

    return context;
    }