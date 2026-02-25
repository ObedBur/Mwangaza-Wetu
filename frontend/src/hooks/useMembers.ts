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
  const { data } = await apiClient.get<PaginatedResponse<MemberRecord>>(API_ROUTES.MEMBRES, {
    params
  });
  return data;
};

const createMember = async (payload: MemberInput): Promise<MemberRecord> => {
  const { data } = await apiClient.post<MemberRecord>(API_ROUTES.MEMBRES, payload);
  return data;
};

export const useMembers = (params: FetchMembersParams = { page: 1, pageSize: 10 }) => {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => fetchMembers(params),
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
