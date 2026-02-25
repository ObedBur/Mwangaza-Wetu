import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountBalance } from '@/types';
import { BalanceInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchBalancesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Hook personnalisé pour la gestion des soldes (comptes)
 * Route backend : GET /api/solde
 */
const fetchBalances = async (params: FetchBalancesParams): Promise<PaginatedResponse<AccountBalance>> => {
  const { data } = await apiClient.get<PaginatedResponse<AccountBalance>>(API_ROUTES.SOLDE, {
    params
  });
  return data;
};

const createBalance = async (payload: BalanceInput): Promise<AccountBalance> => {
  const { data } = await apiClient.post<AccountBalance>(API_ROUTES.SOLDE, payload);
  return data;
};

export const useBalances = (params: FetchBalancesParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['balances', params],
    queryFn: () => fetchBalances(params),
  });
};

export const useCreateBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
};
