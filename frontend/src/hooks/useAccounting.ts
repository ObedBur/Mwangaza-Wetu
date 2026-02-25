import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountingEntry } from '@/types';
import { AccountingInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse } from '@/types/common';
// import { API_ROUTES } from '@/config/api';

/**
 * Hook personnalisé pour la gestion de la comptabilité
 * ⚠️ TODO: Pas de contrôleur backend dédié pour le moment.
 * Les appels API sont en attente d'implémentation backend.
 */

export interface FetchAccountingParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// TODO: Remplacer par API_ROUTES.ACCOUNTING quand le backend sera prêt
const TEMP_ACCOUNTING_ROUTE = '/accounting';

const fetchAccounting = async (params: FetchAccountingParams): Promise<PaginatedResponse<AccountingEntry>> => {
  console.warn('[DEV] useAccounting: route backend /accounting non implémentée');
  const { data } = await apiClient.get<PaginatedResponse<AccountingEntry>>(TEMP_ACCOUNTING_ROUTE, {
    params
  });
  return data;
};

const createAccountingEntry = async (payload: AccountingInput): Promise<AccountingEntry> => {
  console.warn('[DEV] useCreateAccountingEntry: route backend /accounting non implémentée');
  const { data } = await apiClient.post<AccountingEntry>(TEMP_ACCOUNTING_ROUTE, payload);
  return data;
};

export const useAccounting = (params: FetchAccountingParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['accounting', params],
    queryFn: () => fetchAccounting(params),
  });
};

export const useCreateAccountingEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountingEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting'] });
    },
  });
};
