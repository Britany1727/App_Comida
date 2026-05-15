import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platoService } from '../api/platos.service';
import { Plato } from '../types/plato';

const KEY = ['platos'];

export function usePlatos() {
    return useQuery({
        queryKey: ['platos'],
        queryFn: () => {
            console.log('Get ejecutado - se fue a la red');
            return platoService.getAll();
        },
        staleTime: 1000 * 60 * 5
    });
}

export function useAgregarPlato() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (plato: Omit<Plato, 'id' | 'created_at'>) => platoService.add(plato),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useEliminarPlato() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => platoService.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}