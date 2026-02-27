import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RepaymentRecord } from '@/types';
import { RepaymentInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchRepaymentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Hook personnalisé pour la gestion des remboursements
 * Route backend : GET /api/remboursements
 */
const fetchRepayments = async (params: FetchRepaymentsParams): Promise<PaginatedResponse<RepaymentRecord>> => {
  const { data } = await apiClient.get<PaginatedResponse<RepaymentRecord>>(API_ROUTES.REMBOURSEMENTS, {
    params
  });
  return data;
};

const createRepayment = async (payload: RepaymentInput): Promise<RepaymentRecord> => {
  try {
    // Transformation pour correspondre au CreateRemboursementDto du backend
    const backendPayload = {
      creditId: Number(payload.pretId),
      montant: Number(payload.montant),
      devise: payload.devise,
      dateRemboursement: payload.date instanceof Date ? payload.date.toISOString() : new Date(payload.date).toISOString(),
      description: payload.description || `Remboursement du prêt #${payload.pretId}`
    };

    const { data } = await apiClient.post<RepaymentRecord>(API_ROUTES.REMBOURSEMENTS, backendPayload);
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la création du remboursement:', error);
    const backendMsg = error.response?.data?.message;
    const msg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg;
    throw new Error(msg || 'Impossible de créer ce remboursement. Veuillez réessayer.');
  }
};

export const useRepayments = (params: FetchRepaymentsParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['repayments', params],
    queryFn: () => fetchRepayments(params),
  });
};

export const useCreateRepayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repayments'] });
    },
  });
};
