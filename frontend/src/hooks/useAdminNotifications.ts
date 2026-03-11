import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';

/** Hook spécifique pour les notifications administrateur */
export const useAdminNotifications = (adminId?: number) => {
  const queryClient = useQueryClient();

  // Liste des notifications (avec polling discret)
  const query = useQuery({
    queryKey: ['admin-notifications', adminId],
    queryFn: () => notificationsService.getAllAdmin(adminId!),
    enabled: !!adminId,
    refetchInterval: 30000, // 30 secondes (polling)
  });

  // Compteur non-lu (avec polling rapide)
  const unreadQuery = useQuery({
    queryKey: ['admin-unread-count', adminId],
    queryFn: () => notificationsService.getUnreadCountAdmin(adminId!),
    enabled: !!adminId,
    refetchInterval: 30000,
  });

  // Mutations partagées avec membre (car elles agissent sur l'ID de la notification)
  const markAsRead = useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsService.markAllAsReadAdmin(adminId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: number) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  return {
    notifications: query.data || [],
    unreadCount: unreadQuery.data?.count || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isMarkingAll: markAllAsRead.isPending,
  };
};
