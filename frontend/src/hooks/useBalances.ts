import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountBalance } from '@/types';
import { BalanceInput } from '@/lib/validations';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';
import { PaginatedResponse } from '@/types/common';

export interface FetchBalancesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

const fetchBalances = async (params: FetchBalancesParams): Promise<PaginatedResponse<AccountBalance>> => {
  const { data } = await apiClient.get<PaginatedResponse<AccountBalance>>(API_ROUTES.SOLDE, {
    params
  });
  return data;
};

const createBalance = async (payload: BalanceInput): Promise<AccountBalance> => {
  const { data } = await apiClient.post<AccountBalance>(API_ROUTES.SOLDE, payload);
  return data;
};

export const useBalances = (params: FetchBalancesParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['balances', params],
    queryFn: () => fetchBalances(params),
  });
};

export const useCreateBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
};

export interface SoldeDashboardData {
  overview: {
    totalCaisse: { usd: number; fc: number };
    totalEpargne: { usd: number; fc: number };
    totalRetrait: { usd: number; fc: number };
    totalFrais: { usd: number; fc: number };
    totalRevenus: { usd: number; fc: number };
    totalCredits: { usd: number; fc: number };
    totalRemboursements: { usd: number; fc: number };
    activeMembersCount: number;
    activeCreditsCount: number;
    totalMembers: number;
    totalAccounts: number;
  };
  tresorerie: {
    fc: { caisse: number; reserve: number; encoursCredits: number; disponible: number };
    usd: { caisse: number; reserve: number; encoursCredits: number; disponible: number };
  };
  byType: Array<{
    type: string;
    soldeFC: number;
    soldeUSD: number;
    epargneFC: number;
    epargneUSD: number;
    retraitFC: number;
    retraitUSD: number;
    creditFC: number;
    creditUSD: number;
    remboursementFC: number;
    remboursementUSD: number;
  }>;
  history: Array<{
    month: string;
    depotsUSD: number;
    retraitsUSD: number;
    depotsFC: number;
    retraitsFC: number;
  }>;
  dailyHistory: Array<{
    date: string;
    epargne: number;
    retrait: number;
    credit: number;
    remboursement: number;
  }>;
}

export const useSoldeDashboard = () => {
  return useQuery<SoldeDashboardData>({
    queryKey: ['soldeDashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<SoldeDashboardData>(API_ROUTES.SOLDE_DASHBOARD);
      return data;
    },
  });
};
