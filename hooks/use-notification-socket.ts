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
import { BASE_URL, refreshAccessToken } from '@/api/client';

const SOCKET_URL = BASE_URL;

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
    // Guards against retry loops: the server rejects a stale/expired access token with
    // 'error' + disconnect (not 'connect_error'), so recovery has to live here. Reset on
    // every successful connect so a *later* genuine auth failure can still retry once.
    let hasRetriedAuth = false;

    const initSocket = async () => {
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        console.error('No access token found for notification socket');
        return;
      }

      socket = io(`${SOCKET_URL}/notifications`, {
        // websocket-only has no fallback when the initial upgrade handshake hiccups on a
        // flaky mobile connection (NAT, weak wifi, cellular handoff) — it just errors with
        // no recovery path other than a full retry. Allowing polling first lets socket.io
        // establish the session over HTTP and upgrade to websocket once stable, same as
        // its default behavior.
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        autoConnect: true,
        // Scopes this socket's notification room to the customer app specifically, so a
        // dual-role (customer + artisan) account logged into both apps on one device
        // doesn't get artisan-app notifications leaking into this app.
        auth: { token, role: 'user' },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Connected to /notifications');
        setIsConnected(true);
        hasRetriedAuth = false;
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
          socket.auth = { token: freshToken, role: 'user' };
        }
      });

      // The server rejects an expired/invalid access token by emitting 'error' and then
      // disconnecting the socket (not 'connect_error', since the handshake itself
      // succeeded). socket.io-client won't auto-reconnect after a server-initiated
      // disconnect, so without this the socket would stay dead until the app restarts.
      // getAccessToken() alone can't fix this — it returns the same stale token that was
      // just rejected — so this calls refreshAccessToken() to mint a genuinely new one.
      socket.on('error', async (err) => {
        console.error('Notification Socket Error:', err);

        if (err?.message === 'Invalid authentication token' && !hasRetriedAuth) {
          hasRetriedAuth = true;
          const freshToken = await refreshAccessToken();
          if (freshToken && socket) {
            socket.auth = { token: freshToken, role: 'user' };
            socket.connect();
          }
        }
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

        if (socket.connected) {
          // Already connected — refresh notification data
          invalidateNotificationQueries();
          return;
        }

        // Reconnect with whatever's currently cached. Deliberately NOT calling
        // refreshAccessToken() here — that rotates the refresh token, and doing it on
        // every foreground/reconnect (most of which are just a dropped connection, not an
        // actually-expired token) caused the rotation-related logout bug fixed earlier.
        // If this cached token really is stale, the 'error' handler above reactively
        // refreshes once the server actually rejects it.
        const freshToken = await tokenStorage.getAccessToken();
        if (freshToken) {
          socket.auth = { token: freshToken, role: 'user' };
        }
        socket.connect();
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
