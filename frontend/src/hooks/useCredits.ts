import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditRecord } from '@/types';
import { LoanInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchCreditsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

/**
 * Hook personnalisé pour la gestion des crédits
 * Route backend : GET /api/credits
 */
const fetchCredits = async (params: FetchCreditsParams): Promise<PaginatedResponse<CreditRecord>> => {
  const { data } = await apiClient.get<PaginatedResponse<CreditRecord>>(API_ROUTES.CREDITS, {
    params
  });
  return data;
};

const createCredit = async (payload: LoanInput): Promise<CreditRecord> => {
  const { data } = await apiClient.post<CreditRecord>(API_ROUTES.CREDITS, payload);
  return data;
};

export const useCredits = (params: FetchCreditsParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['credits', params],
    queryFn: () => fetchCredits(params),
  });
};

export const useCreateCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCredit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
};
