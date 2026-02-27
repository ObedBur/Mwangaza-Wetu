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
  try {
    // Transformation pour correspondre au CreateWithdrawalDto du backend
    const backendPayload = {
      compte: payload.numeroCompte,
      devise: payload.devise,
      montant: Number(payload.montant),
      dateOperation: payload.date instanceof Date ? payload.date.toISOString() : new Date(payload.date).toISOString(),
      description: payload.description || `Retrait sur le compte ${payload.numeroCompte}`
    };

    const { data } = await apiClient.post<WithdrawalTransaction>(API_ROUTES.WITHDRAWALS, backendPayload);
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la création du retrait:', error);
    const backendMsg = error.response?.data?.message;
    const msg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg;
    throw new Error(msg || 'Impossible de créer ce retrait. Veuillez réessayer.');
  }
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
