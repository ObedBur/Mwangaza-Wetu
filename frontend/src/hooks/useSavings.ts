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
  try {
    const { data } = await apiClient.get<any>(API_ROUTES.EPARGNES, {
      params: {
        ...params,
        type: params.search ? undefined : 'depot' // On filtre par dépôt par défaut
      }
    });

    // Si la donnée est déjà au format paginé
    if (data?.data && Array.isArray(data.data)) {
      return data;
    }
    
    // Si le backend renvoie un tableau simple (non paginé)
    if (Array.isArray(data)) {
      return {
        data,
        meta: {
          total: data.length,
          page: params.page || 1,
          pageSize: params.pageSize || data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }

    return {
      data: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false }
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des épargnes:', error);
    if (error.response?.status === 500) {
      throw new Error('Erreur serveur: Le service est temporairement indisponible');
    }
    return {
      data: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false }
    };
  }
};

const createSavings = async (payload: SavingsInput): Promise<DepositTransaction> => {
  try {
    // Transformation pour correspondre au CreateSavingsDto du backend
    const backendPayload = {
      compte: payload.numeroCompte,
      typeOperation: 'depot',
      devise: payload.devise,
      montant: Number(payload.montant),
      dateOperation: payload.date instanceof Date ? payload.date.toISOString() : new Date(payload.date).toISOString(),
      description: payload.description || `Dépôt sur le compte ${payload.numeroCompte}`
    };

    const { data } = await apiClient.post<DepositTransaction>(API_ROUTES.EPARGNES, backendPayload);
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'épargne:', error);
    // Extraire le message d'erreur du backend si disponible
    const backendMsg = error.response?.data?.message;
    const msg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg;
    throw new Error(msg || 'Impossible de créer cette épargne. Veuillez réessayer.');
  }
};

export const useSavings = (params: FetchSavingsParams = { page: 1, pageSize: 10 }) => {
  const query = useQuery({
    queryKey: ['savings', params],
    queryFn: () => fetchSavings(params),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Erreur serveur')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const refetch = () => {
    query.refetch();
  };

  return {
    ...query,
    refetch,
    isEmpty: !query.isLoading && !query.isError && (!query.data?.data || query.data.data.length === 0),
    isServerError: query.isError && query.error instanceof Error && query.error.message.includes('Erreur serveur'),
  };
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
