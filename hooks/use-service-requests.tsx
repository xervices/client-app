import { useEffect, useCallback, useState } from 'react';
import { useSocketIO } from './use-socket-io';

interface ServiceRequestData {
  id: string;
  title: string;
  budgetMin: number;
  budgetMax: number;
  serviceLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
}

interface ServiceRequestEvent {
  type: 'NEW_SERVICE_REQUEST';
  data: ServiceRequestData;
  timestamp: string;
}

interface UseServiceRequestsConfig {
  url?: string;
  categoryIds?: string[];
  onNewRequest?: (request: ServiceRequestEvent) => void;
}

export const useServiceRequests = (config: UseServiceRequestsConfig = {}) => {
  const { categoryIds = [], onNewRequest } = config;

  const [requests, setRequests] = useState<ServiceRequestEvent[]>([]);
  const [subscribedCategories, setSubscribedCategories] = useState<Set<string>>(new Set());

  const socket = useSocketIO({
    autoConnect: true,
  });

  // Listen for new service requests
  useEffect(() => {
    if (!socket.isConnected) return;

    const handleNewRequest = (data: ServiceRequestEvent) => {
      console.log('📢 New service request:', data);
      setRequests((prev) => [data, ...prev]);
      onNewRequest?.(data);
    };

    socket.on('service_request:new', handleNewRequest);

    return () => {
      socket.off('service_request:new', handleNewRequest);
    };
  }, [socket.isConnected, onNewRequest]);

  // Join category
  const joinCategory = useCallback(
    async (categoryId: string) => {
      if (!socket.isConnected) {
        throw new Error('Socket not connected');
      }

      socket.emit('join_category', { categoryId });
      setSubscribedCategories((prev) => new Set(prev).add(categoryId));
      console.log(`✅ Joined category: ${categoryId}`);
    },
    [socket]
  );

  // Leave category
  const leaveCategory = useCallback(
    async (categoryId: string) => {
      if (!socket.isConnected) {
        throw new Error('Socket not connected');
      }

      socket.emit('leave_category', { categoryId });
      setSubscribedCategories((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
      console.log(`✅ Left category: ${categoryId}`);
    },
    [socket]
  );

  // Auto-join categories on connection
  useEffect(() => {
    if (!socket.isConnected || categoryIds.length === 0) return;

    categoryIds.forEach((categoryId) => {
      joinCategory(categoryId);
    });
  }, [socket.isConnected, categoryIds]);

  // Clear requests
  const clearRequests = useCallback(() => {
    setRequests([]);
  }, []);

  return {
    ...socket,
    requests,
    subscribedCategories,
    joinCategory,
    leaveCategory,
    clearRequests,
  };
};
