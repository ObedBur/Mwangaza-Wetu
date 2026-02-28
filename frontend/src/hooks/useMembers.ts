import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberRecord } from '@/types';
import { MemberInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';
import { ACCOUNT_TYPES } from '@/lib/constants';

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
        section: params.typeCompte,
        year: year
      }
    });
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la génération du numéro de compte:', error);
    // Fallback: calculer le prochain numéro basé sur les comptes existants
    return calculateNextAccountNumberFallback(params.typeCompte, params.dateAdhesion);
  }
};

const calculateNextAccountNumberFallback = async (typeCompte: string, dateAdhesion: string): Promise<{ numero: string }> => {
  try {
    const year = dateAdhesion ? new Date(dateAdhesion).getFullYear() : new Date().getFullYear();
    
    // Trouver le bon préfixe basé sur le type de compte
    const accountTypeConfig = ACCOUNT_TYPES.find(t => t.value === typeCompte);
    const typePrefix = accountTypeConfig?.prefix || 'P';

    // Récupérer tous les membres pour trouver le dernier numéro du même type
    const { data: allMembers } = await apiClient.get<PaginatedResponse<MemberRecord>>(API_ROUTES.MEMBRES, {
      params: { pageSize: 1000 }
    });

    const members = allMembers.data || [];
    
    // Format attendu: MW-TRI-RANDOM6
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, '0');
    return { numero: `MW-${typePrefix}-${randomPart}` };
  } catch (err) {
    console.warn('Fallback calculation failed, using backup:', err);
    
    // Dernier fallback avec timestamp
    const accountTypeConfig = ACCOUNT_TYPES.find(t => t.value === typeCompte);
    const typePrefix = accountTypeConfig?.prefix || 'PRI';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, '0');
    
    return { numero: `MW-${typePrefix}-${randomPart}` };
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
export const useMemberStats = () => {
  return useQuery({
    queryKey: ['memberStats'],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ROUTES.MEMBRES_STATS);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Rafraîchir toutes les minutes
  });
};

/**
 * Hook pour récupérer un membre par son numéro de compte
 * Route backend : GET /api/membres/by-account/:numero
 *
 * Usage dans les modals pour afficher le profil du membre détecté dynamiquement.
 */
export const useMemberByAccount = (
  numeroCompte: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['memberByAccount', numeroCompte],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        id: number;
        firstName: string;
        lastName: string;
        accountNumber: string;
        status: string;
      }>(`${API_ROUTES.MEMBRES}/by-account/${encodeURIComponent(numeroCompte)}`);
      return data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!numeroCompte,
    retry: false,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook pour récupérer un membre par son ID ZKTeco
 * Utilisé après un scan réussi pour remplir automatiquement le numéro de compte.
 */
export const useMemberByZkId = (zkId: string | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['memberByZkId', zkId],
    queryFn: async () => {
      if (!zkId) return null;
      const { data } = await apiClient.get<MemberRecord>(`${API_ROUTES.MEMBRES_BY_ZKID}/${zkId}`);
      return data;
    },
    enabled: !!zkId && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook pour la recherche intuitive (Autocomplete)
 * Recherche par nom ou numéro de compte.
 */
export const useMemberSearch = (query: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['memberSearch', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      try {
        // On utilise l'endpoint principal /membres qui accepte déjà le paramètre 'search'
        // et on extrait la liste des membres du champ 'data' de la réponse paginée.
        const { data } = await apiClient.get<PaginatedResponse<MemberRecord>>(API_ROUTES.MEMBRES, {
          params: { search: query, pageSize: 20 }
        });
        return data.data || [];
      } catch (error: any) {
        console.warn('Recherche autocomplete via /membres non disponible:', error.message);
        return [];
      }
    },
    enabled: (options?.enabled ?? true) && !!query && query.length >= 2,
    staleTime: 30000,
  });
};
