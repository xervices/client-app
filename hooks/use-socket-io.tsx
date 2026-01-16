import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
interface UseSocketIOConfig {
  url?: string;
  autoConnect?: boolean;
  transports?: ('websocket' | 'polling')[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface UseSocketIOReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string) => Promise<void>;
  leaveRoom: (room: string) => Promise<void>;
  isJoiningRoom: boolean;
  joinedRooms: Set<string>;
}

export const useSocketIO = (config: UseSocketIOConfig): UseSocketIOReturn => {
  const {
    url = 'https://server-api-bibv.onrender.com',
    autoConnect = true,
    transports = ['websocket'],
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [joinedRooms] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    const newSocket = io(url, {
      transports,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      autoConnect: false,
    });

    socketRef.current = newSocket;

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
      joinedRooms.clear();
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(err);
      setIsConnecting(false);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
      setIsConnecting(true);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      setIsConnecting(false);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      setError(new Error('Failed to reconnect'));
      setIsConnecting(false);
    });

    // Connect the socket
    setIsConnecting(true);
    newSocket.connect();

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      listenersRef.current.clear();
      joinedRooms.clear();
      newSocket.removeAllListeners();
      newSocket.close();
    };
  }, [url]);

  // Emit event
  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
    } else {
      console.warn(`Cannot emit '${event}': Socket not connected`);
    }
  }, []);

  // Listen for events
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on(event, callback);

    // Track listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)?.add(callback);
  }, []);

  // Remove event listener
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (!socketRef.current) return;

    if (callback) {
      socketRef.current.off(event, callback);
      listenersRef.current.get(event)?.delete(callback);
    } else {
      socketRef.current.off(event);
      listenersRef.current.delete(event);
    }
  }, []);

  // Manual connect
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      setIsConnecting(true);
      socketRef.current.connect();
    }
  }, []);

  // Manual disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      joinedRooms.clear();
    }
  }, []);

  // Join a room
  const joinRoom = useCallback(
    (room: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current?.connected) {
          reject(new Error('Socket not connected'));
          return;
        }

        setIsJoiningRoom(true);

        socketRef.current.emit('join-room', room, (response: any) => {
          setIsJoiningRoom(false);

          if (response?.success || response?.status === 'joined') {
            console.log(`✅ Joined room: ${room}`);
            joinedRooms.add(room);
            resolve();
          } else {
            const error = new Error(response?.message || 'Failed to join room');
            console.error(`❌ Failed to join room ${room}:`, error);
            reject(error);
          }
        });

        // Timeout fallback
        setTimeout(() => {
          if (isJoiningRoom) {
            setIsJoiningRoom(false);
            reject(new Error('Join room timeout'));
          }
        }, 5000);
      });
    },
    [isJoiningRoom]
  );

  // Leave a room
  const leaveRoom = useCallback((room: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('leave-room', room, (response: any) => {
        if (response?.success || response?.status === 'left') {
          console.log(`✅ Left room: ${room}`);
          joinedRooms.delete(room);
          resolve();
        } else {
          const error = new Error(response?.message || 'Failed to leave room');
          console.error(`❌ Failed to leave room ${room}:`, error);
          reject(error);
        }
      });

      // Timeout fallback
      setTimeout(() => {
        reject(new Error('Leave room timeout'));
      }, 5000);
    });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    emit,
    on,
    off,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    isJoiningRoom,
    joinedRooms,
  };
};
