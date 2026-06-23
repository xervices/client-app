import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationSocket } from '@/hooks/use-notification-socket';
import { useAuthStore } from '@/store/auth-store';

type NotificationSocketContextType = ReturnType<typeof useNotificationSocket>;

const NotificationSocketContext = createContext<NotificationSocketContextType | null>(null);

interface NotificationSocketProviderProps {
  children: ReactNode;
}

export const NotificationSocketProvider: React.FC<NotificationSocketProviderProps> = ({
  children,
}) => {
  const { isLoggedIn } = useAuthStore();

  const socketData = useNotificationSocket({
    autoConnect: isLoggedIn,
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
