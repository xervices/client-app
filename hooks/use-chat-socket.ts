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
  // Keep roomId accessible in callbacks without re-running the main effect
  const roomIdRef = useRef(roomId);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onTypingRef.current = onTyping;
  }, [onNewMessage, onTyping]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // Extracted so it can be called both on initial connect and on foreground resume
  const joinRoom = useCallback((socket: ChatSocket) => {
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) return;

    socket.emit('join_room', { roomId: currentRoomId }, (response) => {
      if (response.success) {
        console.log(`Joined room: ${currentRoomId}`);
      } else {
        console.error(`Failed to join room ${currentRoomId}:`, response.error);
      }
    });
  }, []);

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
        joinRoom(socket!);
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
        onNewMessageRef.current?.(event.data);
      });

      socket.on('user_typing', (event) => {
        const { userId, isTyping } = event.data;
        setTypingUsers((prev) => {
          const others = prev.filter((u) => u.userId !== userId);
          return isTyping ? [...others, event.data] : others;
        });
        onTypingRef.current?.(event.data);
      });

      socket.on('messages_read', (event) => {
        console.log('Messages Read:', event);
      });
    };

    initSocket();

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        const socket = socketRef.current;
        if (!socket) return;

        if (socket.connected) {
          // Already connected — re-join the room in case the server dropped it
          joinRoom(socket);
        } else {
          // Calling connect() resets the internal skipReconnect flag that
          // gets set when disconnect() is called manually
          socket.connect();
        }
      }
      // Removed the background disconnect — manually calling disconnect() sets
      // an internal skipReconnect flag that breaks foreground resume.
      // Let the OS/network drop the connection naturally instead.
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      socket?.disconnect();
      socketRef.current = null;
      appStateSubscription.remove();
    };
  }, [autoConnect, joinRoom]);

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
