import React, { createContext, useContext, type ReactNode } from 'react';

import { useOffersSocket } from '@/hooks/use-offers-socket';
import { NewOfferEvent, RequestViewedEvent } from '@/hooks/types';

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
}

export const OffersProvider: React.FC<OffersProviderProps> = ({
  children,
  initialServiceRequestId,
  autoConnect = true,
  onViewed,
  onOffered,
}) => {
  const [activeServiceRequestId, setActiveServiceRequestId] = React.useState<string | undefined>(
    initialServiceRequestId
  );
  const [shouldConnect, setShouldConnect] = React.useState(autoConnect);

  const offersData = useOffersSocket({
    serviceRequestId: activeServiceRequestId,
    autoConnect: shouldConnect,
    onViewed,
    onOffered,
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

export const useOffersContext = (): OffersContextType => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffersContext must be used within an OffersProvider');
  }
  return context;
};
