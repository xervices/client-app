import { useCallback, useEffect, useState } from 'react';
import { useSocketIO } from './use-socket-io';

interface ViewedEvent {
  type: 'REQUEST_VIEWED';
  data: {
    artisanId: string;
    artisanName: string;
  };
  timestamp: string;
}

interface NewOfferEvent {
  type: 'NEW_OFFER';
  data: {
    id: string;
    amount: number;
    message: string;
    artisanId: string;
  };
  timestamp: string;
}

interface CounterOfferEvent {
  type: 'COUNTER_OFFER';
  data: {
    id: string;
    parentOfferId: string;
    amount: number;
  };
  timestamp: string;
}

interface AcceptedOfferEvent {
  type: 'OFFER_ACCEPTED';
  data: {
    offerId: string;
    acceptedBy: string;
  };
  timestamp: string;
}

type OfferEvent = ViewedEvent | NewOfferEvent | CounterOfferEvent | AcceptedOfferEvent;

interface UseOffersConfig {
  url?: string;
  serviceRequestId?: string;
  onViewed?: (event: ViewedEvent) => void;
  onNewOffer?: (event: NewOfferEvent) => void;
  onCounterOffer?: (event: CounterOfferEvent) => void;
  onAccepted?: (event: AcceptedOfferEvent) => void;
}

export const useOffers = (config: UseOffersConfig = {}) => {
  const { serviceRequestId, onViewed, onNewOffer, onCounterOffer, onAccepted } = config;

  const [events, setEvents] = useState<OfferEvent[]>([]);
  const [views, setViews] = useState<ViewedEvent[]>([]);
  const [offers, setOffers] = useState<(NewOfferEvent | CounterOfferEvent)[]>([]);
  const [trackedRequests, setTrackedRequests] = useState<Set<string>>(new Set());

  const socket = useSocketIO({
    autoConnect: true,
  });

  // Listen for all offer events
  useEffect(() => {
    if (!socket.isConnected) return;

    const handleViewed = (data: ViewedEvent) => {
      console.log('👁️ Request viewed:', data);
      setViews((prev) => [data, ...prev]);
      setEvents((prev) => [data, ...prev]);
      onViewed?.(data);
    };

    const handleNewOffer = (data: NewOfferEvent) => {
      console.log('💰 New offer:', data);
      setOffers((prev) => [data, ...prev]);
      setEvents((prev) => [data, ...prev]);
      onNewOffer?.(data);
    };

    const handleCounterOffer = (data: CounterOfferEvent) => {
      console.log('🔄 Counter offer:', data);
      setOffers((prev) => [data, ...prev]);
      setEvents((prev) => [data, ...prev]);
      onCounterOffer?.(data);
    };

    const handleAccepted = (data: AcceptedOfferEvent) => {
      console.log('✅ Offer accepted:', data);
      setEvents((prev) => [data, ...prev]);
      onAccepted?.(data);
    };

    socket.on('request:viewed', handleViewed);
    socket.on('offer:new', handleNewOffer);
    socket.on('offer:counter', handleCounterOffer);
    socket.on('offer:accepted', handleAccepted);

    return () => {
      socket.off('request:viewed', handleViewed);
      socket.off('offer:new', handleNewOffer);
      socket.off('offer:counter', handleCounterOffer);
      socket.off('offer:accepted', handleAccepted);
    };
  }, [socket.isConnected, onViewed, onNewOffer, onCounterOffer, onAccepted]);

  // Join service request room
  const joinServiceRequest = useCallback(
    async (requestId: string) => {
      if (!socket.isConnected) {
        throw new Error('Socket not connected');
      }

      socket.emit('join_service_request', { serviceRequestId: requestId });
      setTrackedRequests((prev) => new Set(prev).add(requestId));
      console.log(`✅ Joined service request: ${requestId}`);
    },
    [socket]
  );

  // Leave service request room (implicit - just stop tracking)
  const leaveServiceRequest = useCallback((requestId: string) => {
    setTrackedRequests((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
    console.log(`✅ Left service request: ${requestId}`);
  }, []);

  // Auto-join service request on connection
  useEffect(() => {
    if (!socket.isConnected || !serviceRequestId) return;

    joinServiceRequest(serviceRequestId);
  }, [socket.isConnected, serviceRequestId]);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setViews([]);
    setOffers([]);
  }, []);

  return {
    ...socket,
    events,
    views,
    offers,
    trackedRequests,
    joinServiceRequest,
    leaveServiceRequest,
    clearEvents,
  };
};
