import React, { createContext, useContext, type ReactNode } from 'react';

import { useOffersSocket } from '@/hooks/use-offers-socket';
import { NewOfferEvent, RequestViewedEvent, OfferRejectedEvent, OfferWithdrawnEvent } from '@/hooks/types';

// Define the shape of the context based on the hook's return type
type OffersContextType = ReturnType<typeof useOffersSocket>;

const OffersContext = createContext<OffersContextType | null>(null);

// Types for the provider props
interface OffersProviderProps {
  children: ReactNode;
  // Optional initial values
  initialServiceRequestId?: string;
  autoConnect?: boolean;
  // Callbacks
  onViewed?: (data: RequestViewedEvent['data']) => void;
  onOffered?: (data: NewOfferEvent['data']) => void;
  onOfferRejected?: (data: OfferRejectedEvent['data']) => void;
  onOfferWithdrawn?: (data: OfferWithdrawnEvent['data']) => void;
}

export const OffersProvider: React.FC<OffersProviderProps> = ({
  children,
  initialServiceRequestId,
  autoConnect = true,
  onViewed,
  onOffered,
  onOfferRejected,
  onOfferWithdrawn,
}) => {
  const [activeServiceRequestId, setActiveServiceRequestId] = React.useState<string | undefined>(
    initialServiceRequestId
  );
  const [shouldConnect, setShouldConnect] = React.useState(autoConnect);

  React.useEffect(() => {
    setShouldConnect(autoConnect);
  }, [autoConnect]);

  const offersData = useOffersSocket({
    serviceRequestId: activeServiceRequestId,
    autoConnect: shouldConnect,
    onViewed,
    onOffered,
    onOfferRejected,
    onOfferWithdrawn,
  });

  const joinServiceRequest = React.useCallback((serviceRequestId: string) => {
    setActiveServiceRequestId(serviceRequestId);
    setShouldConnect(true);
  }, []);

  const value = {
    ...offersData,
    joinServiceRequest, // Override/Wrap the join method
  };

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
};

interface UseOffersContextOptions {
  onOfferEvent?: (eventType: string, data: any) => void;
}

export const useOffersContext = (options?: UseOffersContextOptions): OffersContextType => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffersContext must be used within an OffersProvider');
  }

  // Use useEffect to wrap the context with additional callback handling
  const callbackRef = React.useRef(options?.onOfferEvent);

  React.useEffect(() => {
    callbackRef.current = options?.onOfferEvent;
  }, [options?.onOfferEvent]);

  // These offer arrays live in a single session-long OffersProvider (mounted once) and are
  // never reset between service requests, so a freshly-mounted consumer would otherwise see
  // a non-empty array immediately and replay the last stale event as if it just happened —
  // and any other concurrently-mounted consumer would replay the same event too. Track each
  // array's length as of THIS consumer's mount, and only fire the callback for entries added
  // after that baseline, so only genuinely new events (for this consumer, exactly once) fire.
  const seenLengthsRef = React.useRef({
    offers: context.offers.length,
    views: context.views.length,
    counterOffers: context.counterOffers?.length ?? 0,
    acceptedOffers: context.acceptedOffers?.length ?? 0,
    rejectedOffers: context.rejectedOffers?.length ?? 0,
    withdrawnOffers: context.withdrawnOffers?.length ?? 0,
  });

  // Trigger callback whenever offers change
  React.useEffect(() => {
    if (!callbackRef.current) return;
    if (context.offers.length > seenLengthsRef.current.offers) {
      callbackRef.current('offer:new', context.offers[context.offers.length - 1]);
      seenLengthsRef.current.offers = context.offers.length;
    }
  }, [context.offers]);

  // Trigger callback whenever views change
  React.useEffect(() => {
    if (!callbackRef.current) return;
    if (context.views.length > seenLengthsRef.current.views) {
      callbackRef.current('request:viewed', context.views[context.views.length - 1]);
      seenLengthsRef.current.views = context.views.length;
    }
  }, [context.views]);

  // Trigger callback whenever counter offers change
  React.useEffect(() => {
    if (!callbackRef.current) return;
    const length = context.counterOffers?.length ?? 0;
    if (length > seenLengthsRef.current.counterOffers) {
      callbackRef.current('offer:counter', context.counterOffers![length - 1]);
      seenLengthsRef.current.counterOffers = length;
    }
  }, [context.counterOffers]);

  // Trigger callback whenever accepted offers change
  React.useEffect(() => {
    if (!callbackRef.current) return;
    const length = context.acceptedOffers?.length ?? 0;
    if (length > seenLengthsRef.current.acceptedOffers) {
      callbackRef.current('offer:accepted', context.acceptedOffers![length - 1]);
      seenLengthsRef.current.acceptedOffers = length;
    }
  }, [context.acceptedOffers]);

  // Trigger callback whenever rejected offers change
  React.useEffect(() => {
    if (!callbackRef.current) return;
    const length = context.rejectedOffers?.length ?? 0;
    if (length > seenLengthsRef.current.rejectedOffers) {
      callbackRef.current('offer:rejected', context.rejectedOffers![length - 1]);
      seenLengthsRef.current.rejectedOffers = length;
    }
  }, [context.rejectedOffers]);

  // Trigger callback whenever withdrawn offers change
  React.useEffect(() => {
    if (!callbackRef.current) return;
    const length = context.withdrawnOffers?.length ?? 0;
    if (length > seenLengthsRef.current.withdrawnOffers) {
      callbackRef.current('offer:withdrawn', context.withdrawnOffers![length - 1]);
      seenLengthsRef.current.withdrawnOffers = length;
    }
  }, [context.withdrawnOffers]);

  return context;
};
