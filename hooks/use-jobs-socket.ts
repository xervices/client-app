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
  const [isTracking, setIsTracking] = useState(false); // Local tracking state for artisan
  const onLocationUpdateRef = useRef(onLocationUpdate);
  const onTrackingStartedRef = useRef(onTrackingStarted);
  const onTrackingStoppedRef = useRef(onTrackingStopped);

  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
    onTrackingStartedRef.current = onTrackingStarted;
    onTrackingStoppedRef.current = onTrackingStopped;
  }, [onLocationUpdate, onTrackingStarted, onTrackingStopped]);

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
        if (jobId) {
          socket?.emit('join_job', { jobId }, (response: JoinJobResponse) => {
            if (response.success) {
              console.log(`Joined job room: ${jobId}`);
              if (response.trackingStatus) {
                setTrackingStatus(response.trackingStatus);
              }
            } else {
              console.error(`Failed to join job room ${jobId}:`, response.error);
            }
          });
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from /jobs:', reason);
        setIsConnected(false);
        setIsTracking(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Jobs Socket Connection Error:', err);
      });

      // Listen for server events
      socket.on('location:update', (event) => {
        console.log('Location Update:', event);
        if (onLocationUpdateRef.current) {
          onLocationUpdateRef.current(event.data);
        }
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
        if (onTrackingStartedRef.current) {
          onTrackingStartedRef.current(event.data);
        }
        setTrackingStatus((prev) => ({
          ...prev,
          isTrackingEnabled: true,
        }));
      });

      socket.on('tracking:stopped', (event) => {
        console.log('Tracking Stopped:', event);
        if (onTrackingStoppedRef.current) {
          onTrackingStoppedRef.current(event.data);
        }
        setTrackingStatus((prev) => ({
          ...prev,
          isTrackingEnabled: false,
        }));
        setIsTracking(false);
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
  }, [autoConnect, jobId]);

  // Actions for Artisan
  const startTracking = useCallback(() => {
    return new Promise<SimpleResponse>((resolve, reject) => {
      if (!socketRef.current?.connected || !jobId) {
        reject(new Error('Socket not connected or no job ID'));
        return;
      }
      socketRef.current.emit('start_tracking', { jobId }, (response) => {
        if (response.success) {
          setIsTracking(true);
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to start tracking'));
        }
      });
    });
  }, [jobId]);

  const stopTracking = useCallback(() => {
    return new Promise<SimpleResponse>((resolve, reject) => {
      if (!socketRef.current?.connected || !jobId) {
        reject(new Error('Socket not connected or no job ID'));
        return;
      }
      socketRef.current.emit('stop_tracking', { jobId }, (response) => {
        if (response.success) {
          setIsTracking(false);
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to stop tracking'));
        }
      });
    });
  }, [jobId]);

  const updateLocation = useCallback(
    (latitude: number, longitude: number) => {
      return new Promise<SimpleResponse>((resolve, reject) => {
        if (!socketRef.current?.connected || !jobId) {
          // Silent fail or reject? Often location updates are fire-and-forget, but valid to reject if disconnected.
          reject(new Error('Socket not connected or no job ID'));
          return;
        }
        socketRef.current.emit('update_location', { jobId, latitude, longitude }, (response) => {
          if (response?.success) {
            resolve(response);
          } else {
            // The server might not always return a callback for high-frequency updates,
            // but the docs say it does.
            reject(new Error(response?.error || 'Failed to update location'));
          }
        });
      });
    },
    [jobId]
  );

  return {
    socket: socketRef.current,
    isConnected,
    trackingStatus,
    isTracking, // Local state for artisan showing if they are currently sharing
    startTracking,
    stopTracking,
    updateLocation,
  };
};
