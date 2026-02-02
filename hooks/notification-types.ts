export interface NotificationData {
  id: string;
  type:
    | 'NEW_OFFER'
    | 'OFFER_ACCEPTED'
    | 'OFFER_REJECTED'
    | 'JOB_STARTED'
    | 'JOB_COMPLETED'
    | 'PAYMENT_RECEIVED'
    | 'NEW_MESSAGE'
    | 'NEW_REVIEW';
  title: string;
  message: string;
  referenceType: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export interface NewNotificationEvent {
  type: 'NEW_NOTIFICATION';
  data: NotificationData;
  timestamp: string;
}

export interface NotificationReadEvent {
  type: 'NOTIFICATION_READ';
  data: {
    notificationIds: string[];
  };
  timestamp: string;
}

export interface NotificationCountEvent {
  type: 'UNREAD_COUNT';
  data: {
    unreadCount: number;
  };
  timestamp: string;
}

export interface NotificationServerToClientEvents {
  'notification:new': (event: NewNotificationEvent) => void;
  'notification:read': (event: NotificationReadEvent) => void;
  'notification:count': (event: NotificationCountEvent) => void;
  connected: (event: {
    connectionId: string;
    userId: string;
    room: string;
    timestamp: string;
  }) => void;
  error: (event: { message: string }) => void;
}

export interface NotificationClientToServerEvents {
  register: () => void;
  mark_read: (data: { notificationIds: string[] }) => void;
  get_unread_count: () => void;
}
