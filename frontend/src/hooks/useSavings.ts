import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepositTransaction } from '@/types';
import { SavingsInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchSavingsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Hook personnalisé pour la gestion de l'épargne (dépôts)
 * Route backend : GET /api/epargnes
 */
const fetchSavings = async (params: FetchSavingsParams): Promise<PaginatedResponse<DepositTransaction>> => {
  const { data } = await apiClient.get<PaginatedResponse<DepositTransaction>>(API_ROUTES.EPARGNES, {
    params
  });
  return data;
};

const createSavings = async (payload: SavingsInput): Promise<DepositTransaction> => {
  const { data } = await apiClient.post<DepositTransaction>(API_ROUTES.EPARGNES, payload);
  return data;
};

export const useSavings = (params: FetchSavingsParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['savings', params],
    queryFn: () => fetchSavings(params),
  });
};

export const useCreateSavings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });
};
