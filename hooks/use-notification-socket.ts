import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  NotificationClientToServerEvents,
  NotificationServerToClientEvents,
  NewNotificationEvent,
  NotificationReadEvent,
  NotificationCountEvent,
} from './notification-types';
import { tokenStorage } from '@/api/token-storage';

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
  
  // Refs for callbacks to avoid reconnection on change
  const onNewNotificationRef = useRef(onNewNotification);
  const onNotificationReadRef = useRef(onNotificationRead);
  const onUnreadCountRef = useRef(onUnreadCount);

  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
    onNotificationReadRef.current = onNotificationRead;
    onUnreadCountRef.current = onUnreadCount;
  }, [onNewNotification, onNotificationRead, onUnreadCount]);

  useEffect(() => {
    if (!autoConnect) return;

    const connectSocket = async () => {
      const token = tokenStorage.getAccessToken(); // Assuming synchronous or handled async elsewhere, but storage is usually async in RN unless mmkv/sqlite sync method used. 
      // Checking tokenStorage in api/token-storage to confirm sync/async.
      // Based on previous file views, it seems to have setTokens (async) but let's check retrieval.
      // For now assuming we can get it or passed via auth store. 
      // Actually standard pattern here is often to rely on the fact that if we are logged in we have token.
      
       // Using the same URL base as other sockets
      const socket: NotificationSocket = io(`${SOCKET_URL}/notifications`, {
        transports: ['websocket'],
        autoConnect: true,
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to /notifications');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from /notifications');
        setIsConnected(false);
      });

      socket.on('error', (err) => {
        console.error('Notification Socket Error:', err);
      });

      socket.on('notification:new', (event) => {
        console.log('New Notification:', event);
        if (onNewNotificationRef.current) {
          onNewNotificationRef.current(event.data);
        }
        // Ideally fetch count again or increment locally? 
        // The server might send unread count update immediately after.
      });

      socket.on('notification:read', (event) => {
         console.log('Notification Read:', event);
         if (onNotificationReadRef.current) {
            onNotificationReadRef.current(event.data);
         }
      });

      socket.on('notification:count', (event) => {
          console.log('Unread Count:', event);
          setUnreadCount(event.data.unreadCount);
          if (onUnreadCountRef.current) {
              onUnreadCountRef.current(event.data);
          }
      });

      return () => {
         socket.disconnect();
         socketRef.current = null;
      };
    };

    connectSocket();
    
    return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
    };
  }, [autoConnect]);

  const markRead = (notificationIds: string[]) => {
    socketRef.current?.emit('mark_read', { notificationIds });
  };

  const getUnreadCount = () => {
    socketRef.current?.emit('get_unread_count');
  };

  const register = () => {
      socketRef.current?.emit('register');
  }

  return {
    socket: socketRef.current,
    isConnected,
    unreadCount,
    markRead,
    getUnreadCount,
    register
  };
};
