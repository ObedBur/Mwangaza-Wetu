import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WithdrawalTransaction } from '@/types';
import { WithdrawalInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchRetraitsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Hook personnalisé pour la gestion des retraits
 * Route backend : GET /api/withdrawals
 */
const fetchRetraits = async (params: FetchRetraitsParams): Promise<PaginatedResponse<WithdrawalTransaction>> => {
  const { data } = await apiClient.get<PaginatedResponse<WithdrawalTransaction>>(API_ROUTES.WITHDRAWALS, {
    params
  });
  return data;
};

const createWithdrawal = async (payload: WithdrawalInput): Promise<WithdrawalTransaction> => {
  const { data } = await apiClient.post<WithdrawalTransaction>(API_ROUTES.WITHDRAWALS, payload);
  return data;
};

export const useRetraits = (params: FetchRetraitsParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['retraits', params],
    queryFn: () => fetchRetraits(params),
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retraits'] });
    },
  });
};
