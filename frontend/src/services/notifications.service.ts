import { apiClient } from '@/lib/apiClient';

export interface Notification {
  id: number;
  membreId: number;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'credit' | 'epargne';
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  /** Liste toutes les notifications d'un membre */
  getAll: async (membreId: number): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>(
      `/notifications/membre/${membreId}`,
    );
    return data;
  },

  /** Compteur de notifications non lues */
  getUnreadCount: async (membreId: number): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>(
      `/notifications/membre/${membreId}/unread-count`,
    );
    return data;
  },

  /** Marquer une notification comme lue */
  markAsRead: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(
      `/notifications/${id}/read`,
    );
    return data;
  },

  /** Marquer toutes les notifications d'un membre comme lues */
  markAllAsRead: async (membreId: number): Promise<{ updated: number }> => {
    const { data } = await apiClient.patch<{ updated: number }>(
      `/notifications/membre/${membreId}/read-all`,
    );
    return data;
  },

  /** Supprimer une notification */
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    const { data } = await apiClient.delete<{ deleted: boolean }>(
      `/notifications/${id}`,
    );
    return data;
  },

  // --- ADMINISTRATEURS ---

  getAllAdmin: async (adminId: number): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>(
      `/notifications/admin/${adminId}`,
    );
    return data;
  },

  getUnreadCountAdmin: async (adminId: number): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>(
      `/notifications/admin/${adminId}/unread-count`,
    );
    return data;
  },

  markAllAsReadAdmin: async (adminId: number): Promise<{ updated: number }> => {
    const { data } = await apiClient.patch<{ updated: number }>(
      `/notifications/admin/${adminId}/read-all`,
    );
    return data;
  },
};
