export interface NotificationRaw {
  id?: string;
  _id?: string;
  user_id?: string;
  userId?: string;
  event_type?: string;
  eventType?: string;
  message: string;
  read?: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  eventType: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationFilters {
  unread?: boolean;
  event_type?: string;
  limit?: number;
  offset?: number;
}
