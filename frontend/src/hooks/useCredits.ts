import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditRecord } from '@/types';
import { LoanInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES, withId } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

/** Statistiques agrégées des crédits retournées par le backend */
export interface CreditStats {
  totalAmount: number;
  activeAmount: number;
  overdueAmount: number;
  availableBalance: number;
  totalCount: number;
  activeCount: number;
  overdueCount: number;
}

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
  try {
    const { data } = await apiClient.get<PaginatedResponse<CreditRecord>>(API_ROUTES.CREDITS, {
      params
    });
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des crédits:', error);
    
    // Si c'est une erreur 500, on la propage
    if (error.response?.status === 500) {
      throw new Error('Erreur serveur: Le service est temporairement indisponible');
    }
    
    // Pour les autres erreurs, on retourne des données vides
    return {
      data: [],
      meta: {
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
};

const createCredit = async (payload: LoanInput): Promise<CreditRecord> => {
  try {
    // Transformation pour correspondre au CreateCreditDto du backend
    const backendPayload = {
      numeroCompte: payload.numeroCompte,
      montant: Number(payload.montant),
      devise: payload.devise,
      tauxInteret: Number(payload.tauxInteret),
      duree: Number(payload.duree),
      dateDebut: payload.date instanceof Date ? payload.date.toISOString() : new Date(payload.date).toISOString(),
      description: payload.description || `Crédit pour le compte ${payload.numeroCompte}`
    };

    const { data } = await apiClient.post<CreditRecord>(API_ROUTES.CREDITS, backendPayload);
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la création du crédit:', error);
    // Extraire le message d'erreur du backend si disponible
    const backendMsg = error.response?.data?.message;
    const msg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg;
    throw new Error(msg || 'Impossible de créer ce crédit. Veuillez réessayer.');
  }
};

export const useCredits = (params: FetchCreditsParams = { page: 1, pageSize: 10 }) => {
  const query = useQuery({
    queryKey: ['credits', params],
    queryFn: () => fetchCredits(params),
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

export const useCreateCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCredit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['creditStats'] });
    },
  });
};

/**
 * Hook pour modifier un crédit existant
 * Route backend : PATCH /api/credits/:id
 */
const updateCredit = async ({
  id,
  payload,
}: {
  id: string | number;
  payload: Partial<LoanInput>;
}): Promise<CreditRecord> => {
  try {
    const { data } = await apiClient.patch<CreditRecord>(withId(API_ROUTES.CREDITS, id), payload);
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du crédit:', error);
    throw new Error('Impossible de modifier ce crédit. Veuillez réessayer.');
  }
};

export const useUpdateCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCredit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['creditStats'] });
    },
  });
};

/**
 * Hook pour les statistiques agrégées des crédits
 * Route backend : GET /api/credits/stats
 */
export const useCreditStats = () => {
  return useQuery<CreditStats>({
    queryKey: ['creditStats'],
    queryFn: async () => {
      const { data } = await apiClient.get<CreditStats>(`${API_ROUTES.CREDITS}/stats`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Ne pas lancer d'erreur si l'endpoint n'existe pas encore
    retry: false,
  });
};
