import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  NotificationClientToServerEvents,
  NotificationServerToClientEvents,
  NewNotificationEvent,
  NotificationReadEvent,
  NotificationCountEvent,
} from './notification-types';
import { tokenStorage } from '@/api/token-storage';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = 'https://server-api-bibv.onrender.com';

type NotificationSocket = Socket<
  NotificationServerToClientEvents,
  NotificationClientToServerEvents
>;

interface UseNotificationSocketOptions {
  autoConnect?: boolean;
  onNewNotification?: (data: NewNotificationEvent['data']) => void;
  onNotificationRead?: (data: NotificationReadEvent['data']) => void;
  onUnreadCount?: (data: NotificationCountEvent['data']) => void;
}

export const useNotificationSocket = ({
  autoConnect = true,
  onNewNotification,
  onNotificationRead,
  onUnreadCount,
}: UseNotificationSocketOptions = {}) => {
  const socketRef = useRef<NotificationSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const queryClient = useQueryClient();

  // Refs for callbacks to avoid reconnection on change
  const onNewNotificationRef = useRef(onNewNotification);
  const onNotificationReadRef = useRef(onNotificationRead);
  const onUnreadCountRef = useRef(onUnreadCount);

  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
    onNotificationReadRef.current = onNotificationRead;
    onUnreadCountRef.current = onUnreadCount;
  }, [onNewNotification, onNotificationRead, onUnreadCount]);

  const invalidateNotificationQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'notifications', 'unread'] });
  }, [queryClient]);

  useEffect(() => {
    if (!autoConnect) return;

    let socket: NotificationSocket | null = null;

    const initSocket = async () => {
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        console.error('No access token found for notification socket');
        return;
      }

      socket = io(`${SOCKET_URL}/notifications`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        autoConnect: true,
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Connected to /notifications');
        setIsConnected(true);
        // Invalidate queries on reconnection to get fresh state
        invalidateNotificationQueries();
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from /notifications:', reason);
        setIsConnected(false);
      });

      socket.on('connected', (event) => {
        console.log('Registered for notifications:', event);
      });

      socket.on('connect_error', async (err) => {
        console.error('Notification Socket Connection Error:', err);
        // If connection fails due to auth, try refreshing the token
        if (!socket) return;
        const freshToken = await tokenStorage.getAccessToken();
        if (freshToken) {
          socket.auth = { token: freshToken };
        }
      });

      socket.on('error', (err) => {
        console.error('Notification Socket Error:', err);
      });

      socket.on('notification:new', (event) => {
        console.log('New Notification:', event);
        onNewNotificationRef.current?.(event.data);
        invalidateNotificationQueries();
      });

      socket.on('notification:read', (event) => {
        console.log('Notification Read:', event);
        onNotificationReadRef.current?.(event.data);
        invalidateNotificationQueries();
      });

      socket.on('notification:count', (event) => {
        console.log('Unread Count:', event);
        setUnreadCount(event.data.unreadCount);
        onUnreadCountRef.current?.(event.data);
        invalidateNotificationQueries();
      });
    };

    initSocket();

    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        const socket = socketRef.current;
        if (!socket) return;

        // Always refresh the token so the socket uses the latest one
        const freshToken = await tokenStorage.getAccessToken();
        if (freshToken) {
          socket.auth = { token: freshToken };
        }

        if (socket.connected) {
          // Already connected — refresh notification data
          invalidateNotificationQueries();
        } else {
          // Reconnect the socket with the fresh token
          socket.connect();
        }
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      socket?.disconnect();
      socketRef.current = null;
      appStateSubscription.remove();
    };
  }, [autoConnect, invalidateNotificationQueries]);

  const markRead = useCallback((notificationIds: string[]) => {
    socketRef.current?.emit('mark_read', { notificationIds });
  }, []);

  const getUnreadCount = useCallback(() => {
    socketRef.current?.emit('get_unread_count');
  }, []);

  const register = useCallback(() => {
    socketRef.current?.emit('register');
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    unreadCount,
    markRead,
    getUnreadCount,
    register,
  };
};
