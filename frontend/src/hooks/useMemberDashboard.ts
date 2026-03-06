import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface MemberDashboardData {
  profile: {
    id: number;
    numeroCompte: string;
    nomComplet: string;
    typeCompte: string;
    statut: string;
    dateAdhesion: string;
    photoProfil: string | null;
  };
  balances: {
    savings: {
      USD: number;
      FC: number;
    };
    activeCredits: {
      USD: number;
      FC: number;
    };
  };
  activeCreditsDetails: Array<{
    id: number;
    montantInitial: number;
    montantTotal: number;
    montantRembourse: number;
    restant: number;
    tauxInteret: number;
    devise: string;
    dateDebut: string;
    statut: string;
    progression: number;
  }>;
  recentTransactions: Array<{
    type: 'depot' | 'retrait' | 'remboursement';
    devise: string;
    montant: number;
    date: string;
    description: string;
  }>;
}

const fetchMemberDashboard = async (identifier: string): Promise<MemberDashboardData> => {
  const { data } = await apiClient.get<MemberDashboardData>(`/api/membres/dashboard/${identifier}`);
  return data;
};

export const useMemberDashboard = (identifier?: string) => {
  return useQuery({
    queryKey: ['member-dashboard', identifier],
    queryFn: () => {
      if (!identifier) throw new Error("L'identifiant est requis");
      return fetchMemberDashboard(identifier);
    },
    enabled: !!identifier,
    retry: false, // Ne pas retry sur une erreur 404
  });
};
