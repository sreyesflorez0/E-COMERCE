import { api } from '@/lib/api';
import { NotificationRaw, Notification, NotificationFilters } from '@/types/notification';

const normalizeNotification = (raw: NotificationRaw): Notification => {
  return {
    id: raw.id || raw._id || '',
    userId: raw.userId || raw.user_id || '',
    eventType: raw.eventType || raw.event_type || 'unknown',
    message: raw.message,
    read: raw.read || false,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
  };
};

export const notificationService = {
  getMyNotifications: async (params?: NotificationFilters): Promise<Notification[]> => {
    const response = await api.get('/notifications/me', { params });
    // Assuming the API might return an array directly or inside a data/notifications object.
    const data = response.data?.notifications || response.data || [];
    if (Array.isArray(data)) {
      return data.map(normalizeNotification);
    }
    return [];
  },

  getNotificationById: async (notificationId: string): Promise<Notification> => {
    const response = await api.get(`/notifications/${notificationId}`);
    return normalizeNotification(response.data);
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  }
};
