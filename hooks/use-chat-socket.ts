import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '@/api/token-storage';
import {
  ChatClientToServerEvents,
  ChatServerToClientEvents,
  MessageData,
  NewMessageEvent,
  UserTypingEvent,
  SendMessageResponse,
} from './types';
import { AppState } from 'react-native';

const SOCKET_URL = 'https://server-api-bibv.onrender.com';

type ChatSocket = Socket<ChatServerToClientEvents, ChatClientToServerEvents>;

interface UseChatSocketOptions {
  roomId?: string;
  autoConnect?: boolean;
  onNewMessage?: (message: MessageData) => void;
  onTyping?: (data: UserTypingEvent['data']) => void;
}

export const useChatSocket = ({
  roomId,
  autoConnect = true,
  onNewMessage,
  onTyping,
}: UseChatSocketOptions = {}) => {
  const socketRef = useRef<ChatSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<UserTypingEvent['data'][]>([]);

  const onNewMessageRef = useRef(onNewMessage);
  const onTypingRef = useRef(onTyping);

  // Keep refs updated
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onTypingRef.current = onTyping;
  }, [onNewMessage, onTyping]);

  useEffect(() => {
    if (!autoConnect) return;

    let socket: ChatSocket | null = null;

    const initSocket = async () => {
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        console.error('No access token found for chat socket');
        return;
      }

      socket = io(`${SOCKET_URL}/chat`, {
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
        console.log('✅ Connected to /chat');
        setIsConnected(true);
        if (roomId) {
          socket?.emit('join_room', { roomId }, (response) => {
            if (response.success) {
              console.log(`Joined room: ${roomId}`);
            } else {
              console.error(`Failed to join room ${roomId}:`, response.error);
            }
          });
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from /chat:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Chat Socket Connection Error:', err);
      });

      socket.on('new_message', (event) => {
        console.log('New Message:', event);
        if (onNewMessageRef.current) {
          onNewMessageRef.current(event.data);
        }
      });

      socket.on('user_typing', (event) => {
        // Update typing users list
        const { userId, isTyping } = event.data;
        setTypingUsers((prev) => {
          const others = prev.filter((u) => u.userId !== userId);
          return isTyping ? [...others, event.data] : others;
        });

        if (onTypingRef.current) {
          onTypingRef.current(event.data);
        }
      });

      socket.on('messages_read', (event) => {
        console.log('Messages Read:', event);
      });
    };

    initSocket();

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      } else if (nextAppState === 'background') {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.disconnect();
        }
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }

      appStateSubscription.remove();
    };
  }, [autoConnect, roomId]);

  const sendMessage = useCallback((content: string, roomId: string) => {
    return new Promise<SendMessageResponse>((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      socketRef.current.emit('send_message', { roomId, content }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }, []);

  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing', { roomId, isTyping });
  }, []);

  const markRead = useCallback((roomId: string, messageIds: string[]) => {
    return new Promise<{ success: boolean; updated?: number }>((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      socketRef.current.emit('mark_read', { roomId, messageIds }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error('Failed to mark messages as read'));
        }
      });
    });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    sendTyping,
    markRead,
    typingUsers,
  };
};
