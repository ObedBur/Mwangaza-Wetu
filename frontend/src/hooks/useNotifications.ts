import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';

const POLL_INTERVAL = 30_000; // 30 secondes

export const useNotifications = (membreId: number | undefined) => {
  const queryClient = useQueryClient();
  const enabled = !!membreId && membreId > 0;

  /** Liste complète des notifications */
  const notificationsQuery = useQuery({
    queryKey: ['notifications', membreId],
    queryFn: () => notificationsService.getAll(membreId!),
    enabled,
    staleTime: 10_000,
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
  });

  /** Compteur non-lus (léger, poll fréquent) */
  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread', membreId],
    queryFn: () => notificationsService.getUnreadCount(membreId!),
    enabled,
    staleTime: 10_000,
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
  });

  /** Marquer une notif comme lue */
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', membreId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', membreId] });
    },
  });

  /** Marquer toutes comme lues */
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(membreId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', membreId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', membreId] });
    },
  });

  /** Supprimer une notif */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', membreId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', membreId] });
    },
  });

  return {
    notifications: notificationsQuery.data ?? [],
    isLoading: notificationsQuery.isLoading,
    unreadCount: unreadCountQuery.data?.count ?? 0,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    isMarkingAll: markAllAsReadMutation.isPending,
  };
};
