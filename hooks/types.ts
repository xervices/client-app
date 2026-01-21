export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}
// ----------------------------------------------------------------------
// 1. Service Requests Namespace Types
// ----------------------------------------------------------------------
export interface ServiceRequestData {
  id: string;
  title: string;
  description?: string;
  serviceAddress?: string;
  serviceLocation?: Location;
  budgetMin: number;
  budgetMax: number;
  preferredDate?: string;
  createdAt: string;
  categoryId: string;
}
export interface NewServiceRequestEvent {
  type: 'NEW_SERVICE_REQUEST';
  data: ServiceRequestData;
  timestamp: string;
}
export interface ServiceRequestCancelledEvent {
  type: 'SERVICE_REQUEST_CANCELLED';
  data: {
    serviceRequestId: string;
  };
  timestamp: string;
}
export interface RegisterArtisanPayload {
  artisanId: string;
}
export interface RegisterArtisanResponse {
  success: boolean;
  artisanId: string;
}
export interface JoinCategoryPayload {
  categoryId: string;
}
// Server -> Client Events
export interface ServiceRequestsServerToClientEvents {
  'service_request:new': (payload: NewServiceRequestEvent) => void;
  'service_request:cancelled': (payload: ServiceRequestCancelledEvent) => void;
}
// Client -> Server Events
export interface ServiceRequestsClientToServerEvents {
  register_artisan: (
    payload: RegisterArtisanPayload,
    callback?: (response: RegisterArtisanResponse) => void
  ) => void;
  join_category: (payload: JoinCategoryPayload) => void;
  leave_category: (payload: JoinCategoryPayload) => void;
}
// ----------------------------------------------------------------------
// 2. Offers Namespace Types
// ----------------------------------------------------------------------
export interface RequestViewedEvent {
  type: 'REQUEST_VIEWED';
  data: {
    artisanId: string;
    artisanName: string;
  };
  timestamp: string;
}
export interface NewOfferEvent {
  type: 'NEW_OFFER';
  data: {
    id: string;
    amount: number;
    message: string;
    artisanId: string;
  };
  timestamp: string;
}
export interface CounterOfferEvent {
  type: 'COUNTER_OFFER';
  data: {
    id: string;
    parentOfferId: string;
    amount: number;
  };
  timestamp: string;
}
export interface OfferAcceptedEvent {
  type: 'OFFER_ACCEPTED';
  data: {
    offerId: string;
    acceptedBy: string;
  };
  timestamp: string;
}
export interface JoinServiceRequestPayload {
  serviceRequestId: string;
}
// Server -> Client Events
export interface OffersServerToClientEvents {
  'request:viewed': (payload: RequestViewedEvent) => void;
  'offer:new': (payload: NewOfferEvent) => void;
  'offer:counter': (payload: CounterOfferEvent) => void;
  'offer:accepted': (payload: OfferAcceptedEvent) => void;
}
// Client -> Server Events
export interface OffersClientToServerEvents {
  join_service_request: (payload: JoinServiceRequestPayload) => void;
}
