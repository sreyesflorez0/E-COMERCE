import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { NotificationFilters } from '@/types/notification';
import { useAuthStore } from '@/store/authStore';

export const useNotifications = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuthStore();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getMyNotifications(filters),
    enabled: isAuthenticated,
  });

  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const data = await notificationService.getMyNotifications({ unread: true });
      return data.length;
    },
    enabled: isAuthenticated,
    // Don't refetch on window focus to avoid spamming the endpoint just for the badge
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once for the badge
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return {
    notifications: notificationsQuery.data,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    
    unreadCount: unreadCountQuery.data || 0,
    isUnreadCountLoading: unreadCountQuery.isLoading,
    
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    
    deleteNotification: deleteNotificationMutation.mutate,
    isDeleting: deleteNotificationMutation.isPending,
  };
};
