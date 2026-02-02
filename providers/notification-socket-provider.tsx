import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useNotificationSocket } from '@/hooks/use-notification-socket';
import { NewNotificationEvent, NotificationReadEvent, NotificationCountEvent } from '@/hooks/notification-types';
import { useAuthStore } from '@/store/auth-store';

type NotificationSocketContextType = ReturnType<typeof useNotificationSocket>;

const NotificationSocketContext = createContext<NotificationSocketContextType | null>(null);

interface NotificationSocketProviderProps {
  children: ReactNode;
  onNewNotification?: (data: NewNotificationEvent['data']) => void;
  onNotificationRead?: (data: NotificationReadEvent['data']) => void;
  onUnreadCount?: (data: NotificationCountEvent['data']) => void;
}

export const NotificationSocketProvider: React.FC<NotificationSocketProviderProps> = ({
  children,
  onNewNotification,
  onNotificationRead,
  onUnreadCount,
}) => {
  const { isLoggedIn } = useAuthStore();
  
  const socketData = useNotificationSocket({
    autoConnect: isLoggedIn, // Only connect if logged in
    onNewNotification,
    onNotificationRead,
    onUnreadCount,
  });

  return (
    <NotificationSocketContext.Provider value={socketData}>
      {children}
    </NotificationSocketContext.Provider>
  );
};

export const useNotificationSocketContext = () => {
  const context = useContext(NotificationSocketContext);
  if (!context) {
    throw new Error('useNotificationSocketContext must be used within a NotificationSocketProvider');
  }
  return context;
};
