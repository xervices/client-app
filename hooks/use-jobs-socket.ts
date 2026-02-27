import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '@/api/token-storage';
import {
  JobsClientToServerEvents,
  JobsServerToClientEvents,
  LocationUpdateEvent,
  TrackingStartedEvent,
  TrackingStoppedEvent,
  TrackingStatus,
  SimpleResponse,
  JoinJobResponse,
} from './types';
import { AppState } from 'react-native';

const SOCKET_URL = 'https://server-api-bibv.onrender.com';

type JobsSocket = Socket<JobsServerToClientEvents, JobsClientToServerEvents>;

interface UseJobsSocketOptions {
  jobId?: string;
  autoConnect?: boolean;
  onLocationUpdate?: (data: LocationUpdateEvent['data']) => void;
  onTrackingStarted?: (data: TrackingStartedEvent['data']) => void;
  onTrackingStopped?: (data: TrackingStoppedEvent['data']) => void;
}

export const useJobsSocket = ({
  jobId,
  autoConnect = true,
  onLocationUpdate,
  onTrackingStarted,
  onTrackingStopped,
}: UseJobsSocketOptions = {}) => {
  const socketRef = useRef<JobsSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const onLocationUpdateRef = useRef(onLocationUpdate);
  const onTrackingStartedRef = useRef(onTrackingStarted);
  const onTrackingStoppedRef = useRef(onTrackingStopped);
  // Keep jobId accessible in callbacks without re-running the main effect
  const jobIdRef = useRef(jobId);

  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
    onTrackingStartedRef.current = onTrackingStarted;
    onTrackingStoppedRef.current = onTrackingStopped;
  }, [onLocationUpdate, onTrackingStarted, onTrackingStopped]);

  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);

  // Extracted so it can be called both on initial connect and on foreground resume
  const joinJobRoom = useCallback((socket: JobsSocket) => {
    const currentJobId = jobIdRef.current;
    if (!currentJobId) return;

    socket.emit('join_job', { jobId: currentJobId }, (response: JoinJobResponse) => {
      if (response.success) {
        console.log(`Joined job room: ${currentJobId}`);
        if (response.trackingStatus) {
          setTrackingStatus(response.trackingStatus);
        }
      } else {
        console.error(`Failed to join job room ${currentJobId}:`, response.error);
      }
    });
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    let socket: JobsSocket | null = null;

    const initSocket = async () => {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        console.error('No access token found for jobs socket');
        return;
      }

      socket = io(`${SOCKET_URL}/jobs`, {
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
        console.log('✅ Connected to /jobs');
        setIsConnected(true);
        joinJobRoom(socket!);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from /jobs:', reason);
        setIsConnected(false);
        setIsTracking(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Jobs Socket Connection Error:', err);
      });

      socket.on('location:update', (event) => {
        console.log('Location Update:', event);
        onLocationUpdateRef.current?.(event.data);
        setTrackingStatus((prev) => ({
          ...prev,
          isTrackingEnabled: true,
          lastLocation: {
            latitude: event.data.latitude,
            longitude: event.data.longitude,
            updatedAt: event.data.updatedAt,
          },
        }));
      });

      socket.on('tracking:started', (event) => {
        console.log('Tracking Started:', event);
        onTrackingStartedRef.current?.(event.data);
        setTrackingStatus((prev) => ({ ...prev, isTrackingEnabled: true }));
      });

      socket.on('tracking:stopped', (event) => {
        console.log('Tracking Stopped:', event);
        onTrackingStoppedRef.current?.(event.data);
        setTrackingStatus((prev) => ({ ...prev, isTrackingEnabled: false }));
        setIsTracking(false);
      });
    };

    initSocket();

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        const socket = socketRef.current;
        if (!socket) return;

        if (socket.connected) {
          // Already connected — just re-join the room in case the server dropped it
          joinJobRoom(socket);
        } else {
          // socket.connect() after a manual disconnect won't auto-reconnect reliably,
          // so we reconnect fresh by calling connect() which resets the skipReconnect flag.
          socket.connect();
        }
      }
      // Removed the background disconnect — let the OS/network handle the drop naturally.
      // Manually disconnecting sets an internal skipReconnect flag that breaks foreground resume.
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      socket?.disconnect();
      socketRef.current = null;
      appStateSubscription.remove();
    };
  }, [autoConnect, joinJobRoom]);

  const startTracking = useCallback(() => {
    return new Promise<SimpleResponse>((resolve, reject) => {
      if (!socketRef.current?.connected || !jobIdRef.current) {
        reject(new Error('Socket not connected or no job ID'));
        return;
      }
      socketRef.current.emit('start_tracking', { jobId: jobIdRef.current }, (response) => {
        if (response.success) {
          setIsTracking(true);
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to start tracking'));
        }
      });
    });
  }, []);

  const stopTracking = useCallback(() => {
    return new Promise<SimpleResponse>((resolve, reject) => {
      if (!socketRef.current?.connected || !jobIdRef.current) {
        reject(new Error('Socket not connected or no job ID'));
        return;
      }
      socketRef.current.emit('stop_tracking', { jobId: jobIdRef.current }, (response) => {
        if (response.success) {
          setIsTracking(false);
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to stop tracking'));
        }
      });
    });
  }, []);

  const updateLocation = useCallback((latitude: number, longitude: number) => {
    return new Promise<SimpleResponse>((resolve, reject) => {
      if (!socketRef.current?.connected || !jobIdRef.current) {
        reject(new Error('Socket not connected or no job ID'));
        return;
      }
      socketRef.current.emit(
        'update_location',
        { jobId: jobIdRef.current, latitude, longitude },
        (response) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Failed to update location'));
          }
        }
      );
    });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    trackingStatus,
    isTracking,
    startTracking,
    stopTracking,
    updateLocation,
  };
};
