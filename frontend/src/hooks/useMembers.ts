import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberRecord } from '@/types';
import { MemberInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchMembersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statut?: string;
}

/**
 * Hook personnalisé pour la gestion des membres
 * Route backend : GET /api/membres
 */
const fetchMembers = async (params: FetchMembersParams): Promise<PaginatedResponse<MemberRecord>> => {
  try {
    const { data } = await apiClient.get<PaginatedResponse<MemberRecord>>(API_ROUTES.MEMBRES, {
      params
    });
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des membres:', error);

    // Si c'est une erreur 500, on la propage pour que le composant puisse l'afficher
    if (error.response?.status === 500) {
      throw new Error('Erreur serveur: Le service est temporairement indisponible');
    }

    // Pour les autres erreurs (404, réseau, etc.), on retourne des données vides
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

const createMember = async (payload: MemberInput): Promise<MemberRecord> => {
  try {
    const { data } = await apiClient.post<MemberRecord>(API_ROUTES.MEMBRES, payload);
    return data;
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    throw new Error('Impossible de créer le membre. Veuillez réessayer.');
  }
};

const generateAccountNumber = async (params: { typeCompte: string; dateAdhesion: string }): Promise<{ numero: string }> => {
  try {
    const year = params.dateAdhesion ? new Date(params.dateAdhesion).getFullYear() : new Date().getFullYear();

    // On envoie les bons noms de paramètres attendus par le backend
    const { data } = await apiClient.get<{ numero: string }>(API_ROUTES.MEMBRES_GENERATE_NUMERO, {
      params: {
        section: params.typeCompte, // Le backend fera la conversion ou on peut envoyer la lettre
        year: year
      }
    });
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la génération du numéro de compte:', error);

    // Générer un numéro de compte fallback au format du backend
    const typeCompteInitial = params.typeCompte?.charAt(0)?.toUpperCase() || 'P';
    const currentYear = new Date().getFullYear();

    // Générer un numéro séquentiel (4 chiffres) avec timestamp
    const timestamp = Date.now();
    const sequentialNumber = (timestamp % 9999) + 1;
    const paddedNumber = sequentialNumber.toString().padStart(4, '0');

    // Format court: COOP-M-2026-0001 (pas COOP-MUTOTO-2026-0001)
    const fallbackNumero = `COOP-${typeCompteInitial}-${currentYear}-${paddedNumber}`;

    return { numero: fallbackNumero };
  }
};

export const useMembers = (params: FetchMembersParams = { page: 1, pageSize: 10 }) => {
  const query = useQuery({
    queryKey: ['members', params],
    queryFn: () => fetchMembers(params),
    retry: (failureCount, error) => {
      // Si c'est une erreur 500, on la propage pour que le composant puisse l'afficher
      if (error instanceof Error && error.message.includes('Erreur serveur')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fonction de retry manuelle
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

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
    },
  });
};

export const useGenerateAccountNumber = (typeCompte: string, dateAdhesion: string) => {
  return useQuery({
    queryKey: ['generateAccountNumber', typeCompte, dateAdhesion],
    queryFn: async () => {
      // S'assurer que les paramètres sont valides
      const params = {
        typeCompte: typeCompte || 'PRINCIPAL',
        dateAdhesion: dateAdhesion || new Date().toISOString().split('T')[0]
      };

      const result = await generateAccountNumber(params);
      return result.numero;
    },
    // Toujours activé, même avec des paramètres vides (fallback automatique)
    enabled: true,
    retry: false,
    staleTime: 0, // Toujours considérer comme obsolète pour forcer le refresh
    gcTime: 0,    // Ne pas garder en mémoire
    refetchOnWindowFocus: false,
  });
};
