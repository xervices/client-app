import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  OffersClientToServerEvents,
  OffersServerToClientEvents,
  NewOfferEvent,
  RequestViewedEvent,
  OfferAcceptedEvent,
  CounterOfferEvent,
} from './types';

const SOCKET_URL = 'https://server-api-bibv.onrender.com';
type OffersSocket = Socket<OffersServerToClientEvents, OffersClientToServerEvents>;
interface UseOffersOptions {
  serviceRequestId?: string;
  autoConnect?: boolean;
  onViewed?: (data: RequestViewedEvent['data']) => void;
  onOffered?: (data: NewOfferEvent['data']) => void;
}
export const useOffersSocket = ({
  serviceRequestId,
  autoConnect = true,
  onViewed,
  onOffered,
}: UseOffersOptions = {}) => {
  const socketRef = useRef<OffersSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [offers, setOffers] = useState<NewOfferEvent['data'][]>([]);
  const [views, setViews] = useState<RequestViewedEvent['data'][]>([]);
  const onViewedRef = useRef(onViewed);
  const onOfferedRef = useRef(onOffered);
  // Update refs when props change to avoid re-connecting socket
  useEffect(() => {
    onViewedRef.current = onViewed;
    onOfferedRef.current = onOffered;
  }, [onViewed, onOffered]);
  useEffect(() => {
    if (!autoConnect) return;
    const socket: OffersSocket = io(`${SOCKET_URL}/offers`, {
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      console.log('Connected to /offers');
      setIsConnected(true);
      if (serviceRequestId) {
        socket.emit('join_service_request', { serviceRequestId });
        console.log(`Joined Service Request room: ${serviceRequestId}`);
      }
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from /offers');
      setIsConnected(false);
    });
    socket.on('offer:new', (event) => {
      console.log('New Offer:', event);
      setOffers((prev) => [...prev, event.data]);
      if (onOfferedRef.current) {
        onOfferedRef.current(event.data);
      }
    });
    socket.on('request:viewed', (event) => {
      console.log('Request Viewed:', event);
      setViews((prev) => [...prev, event.data]);
      if (onViewedRef.current) {
        onViewedRef.current(event.data);
      }
    });
    socket.on('offer:counter', (event: CounterOfferEvent) => {
      console.log('Counter Offer:', event);
      // Logic to update existing offer could go here
    });
    socket.on('offer:accepted', (event: OfferAcceptedEvent) => {
      console.log('Offer Accepted:', event);
      // Logic to handle acceptance
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, serviceRequestId]);
  const joinServiceRequest = (serviceRequestId: string) => {
    socketRef.current?.emit('join_service_request', { serviceRequestId });
  };
  return {
    socket: socketRef.current,
    isConnected,
    offers,
    views,
    joinServiceRequest,
  };
};
