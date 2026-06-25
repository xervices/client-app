import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  OffersClientToServerEvents,
  OffersServerToClientEvents,
  NewOfferEvent,
  RequestViewedEvent,
  OfferAcceptedEvent,
  OfferRejectedEvent,
  OfferWithdrawnEvent,
  CounterOfferEvent,
} from './types';
import { BASE_URL } from '@/api/client';

const SOCKET_URL = BASE_URL;
type OffersSocket = Socket<OffersServerToClientEvents, OffersClientToServerEvents>;
interface UseOffersOptions {
  serviceRequestId?: string;
  autoConnect?: boolean;
  onViewed?: (data: RequestViewedEvent['data']) => void;
  onOffered?: (data: NewOfferEvent['data']) => void;
  onCounterOffer?: (data: CounterOfferEvent['data']) => void;
  onOfferAccepted?: (data: OfferAcceptedEvent['data']) => void;
  onOfferRejected?: (data: OfferRejectedEvent['data']) => void;
  onOfferWithdrawn?: (data: OfferWithdrawnEvent['data']) => void;
}
export const useOffersSocket = ({
  serviceRequestId,
  autoConnect = true,
  onViewed,
  onOffered,
  onCounterOffer,
  onOfferAccepted,
  onOfferRejected,
  onOfferWithdrawn,
}: UseOffersOptions = {}) => {
  const socketRef = useRef<OffersSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [offers, setOffers] = useState<NewOfferEvent['data'][]>([]);
  const [views, setViews] = useState<RequestViewedEvent['data'][]>([]);
  const [counterOffers, setCounterOffers] = useState<CounterOfferEvent['data'][]>([]);
  const [acceptedOffers, setAcceptedOffers] = useState<OfferAcceptedEvent['data'][]>([]);
  const [rejectedOffers, setRejectedOffers] = useState<OfferRejectedEvent['data'][]>([]);
  const [withdrawnOffers, setWithdrawnOffers] = useState<OfferWithdrawnEvent['data'][]>([]);
  const onViewedRef = useRef(onViewed);
  const onOfferedRef = useRef(onOffered);
  const onCounterOfferRef = useRef(onCounterOffer);
  const onOfferAcceptedRef = useRef(onOfferAccepted);
  const onOfferRejectedRef = useRef(onOfferRejected);
  const onOfferWithdrawnRef = useRef(onOfferWithdrawn);
  // Update refs when props change to avoid re-connecting socket
  useEffect(() => {
    onViewedRef.current = onViewed;
    onOfferedRef.current = onOffered;
    onCounterOfferRef.current = onCounterOffer;
    onOfferAcceptedRef.current = onOfferAccepted;
    onOfferRejectedRef.current = onOfferRejected;
    onOfferWithdrawnRef.current = onOfferWithdrawn;
  }, [onViewed, onOffered, onCounterOffer, onOfferAccepted, onOfferRejected, onOfferWithdrawn]);
  // Reset accumulated state when switching to a different service request
  useEffect(() => {
    setViews([]);
  }, [serviceRequestId]);
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
      setCounterOffers((prev) => [...prev, event.data]);
      if (onCounterOfferRef.current) {
        onCounterOfferRef.current(event.data);
      }
    });
    socket.on('offer:accepted', (event: OfferAcceptedEvent) => {
      console.log('Offer Accepted:', event);
      setAcceptedOffers((prev) => [...prev, event.data]);
      if (onOfferAcceptedRef.current) {
        onOfferAcceptedRef.current(event.data);
      }
    });
    socket.on('offer:rejected', (event: OfferRejectedEvent) => {
      console.log('Offer Rejected:', event);
      setRejectedOffers((prev) => [...prev, event.data]);
      if (onOfferRejectedRef.current) {
        onOfferRejectedRef.current(event.data);
      }
    });
    socket.on('offer:withdrawn', (event: OfferWithdrawnEvent) => {
      console.log('Offer Withdrawn:', event);
      setWithdrawnOffers((prev) => [...prev, event.data]);
      if (onOfferWithdrawnRef.current) {
        onOfferWithdrawnRef.current(event.data);
      }
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
    counterOffers,
    acceptedOffers,
    rejectedOffers,
    withdrawnOffers,
    joinServiceRequest,
  };
};
