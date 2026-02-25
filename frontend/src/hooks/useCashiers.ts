import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cashier } from '@/types';
import { CashierInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse } from '@/types/common';
// import { API_ROUTES } from '@/config/api';

/**
 * Hook personnalisé pour la gestion des guichetiers
 * ⚠️ TODO: Pas de contrôleur backend dédié pour le moment.
 * Les appels API sont en attente d'implémentation backend.
 */

export interface FetchCashiersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// TODO: Remplacer par API_ROUTES.CASHIERS quand le backend sera prêt
const TEMP_CASHIERS_ROUTE = '/cashiers';

const fetchCashiers = async (params: FetchCashiersParams): Promise<PaginatedResponse<Cashier>> => {
  console.warn('[DEV] useCashiers: route backend /cashiers non implémentée');
  const { data } = await apiClient.get<PaginatedResponse<Cashier>>(TEMP_CASHIERS_ROUTE, {
    params
  });
  return data;
};

const createCashier = async (payload: CashierInput): Promise<Cashier> => {
  console.warn('[DEV] useCreateCashier: route backend /cashiers non implémentée');
  const { data } = await apiClient.post<Cashier>(TEMP_CASHIERS_ROUTE, payload);
  return data;
};

export const useCashiers = (params: FetchCashiersParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['cashiers', params],
    queryFn: () => fetchCashiers(params),
  });
};

export const useCreateCashier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashiers'] });
    },
  });
};
