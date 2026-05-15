import {Plato} from '../types/plato';
import {supabase} from './supabase';

export const platoService = {
    getAll: async (): Promise<Plato[]> => {
        const {data, error} = await supabase
            .from('platos')
            .select('*')
            .order('created_at', {ascending: false});

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    getById: async (id: string): Promise<Plato | null> => {
        const {data, error} = await supabase
            .from('platos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    add: async (plato: Omit<Plato, 'id' | 'created_at'>): Promise<Plato> => {
        const {data, error} = await supabase
            .from('platos')
            .insert(plato)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },
};