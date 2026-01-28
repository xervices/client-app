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
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  categoryId: string;
  categoryName: string;
  serviceAddress: string;
  preferredDate: string | null;
  createdAt: string;
  user: {
    avatarUrl: string;
    name: string;
  };
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
    amount: number;
    artisanId: string;
    createdAt: string;
    id: string;
    message: string | null;
    offeredBy: string;
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
// ----------------------------------------------------------------------
// 3. Chat Namespace Types
// ----------------------------------------------------------------------
export interface ChatUser {
  id: string;
  profile: {
    fullName: string;
    avatarUrl: string;
  };
}
export interface MessageData {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: ChatUser;
}
export interface NewMessageEvent {
  type: 'NEW_MESSAGE';
  data: MessageData;
  timestamp: string;
}
export interface MessagesReadEvent {
  type: 'MESSAGES_READ';
  data: {
    roomId: string;
    messageIds: string[];
    readBy: string;
  };
  timestamp: string;
}
export interface UserTypingEvent {
  type: 'USER_TYPING';
  data: {
    roomId: string;
    userId: string;
    isTyping: boolean;
  };
  timestamp: string;
}
export interface JoinRoomPayload {
  roomId: string;
}
export interface LeaveRoomPayload {
  roomId: string;
}
export interface SendMessagePayload {
  roomId: string;
  content: string;
}
export interface MarkReadPayload {
  roomId: string;
  messageIds: string[];
}
export interface TypingPayload {
  roomId: string;
  isTyping: boolean;
}
export interface JoinRoomResponse {
  success: boolean;
  room?: string;
  message?: string;
  error?: string;
}
export interface SendMessageResponse {
  success: boolean;
  message?: MessageData;
  error?: string;
}
export interface MarkReadResponse {
  success: boolean;
  updated?: number;
}
export interface TypingResponse {
  success: boolean;
}
// Server -> Client Events
export interface ChatServerToClientEvents {
  new_message: (payload: NewMessageEvent) => void;
  messages_read: (payload: MessagesReadEvent) => void;
  user_typing: (payload: UserTypingEvent) => void;
  // Connection events are handled by socket.io client directly, but we can type the data
  connected: (data: { connectionId: string; userId: string; timestamp: string }) => void;
  error: (data: { message: string }) => void;
}
// Client -> Server Events
export interface ChatClientToServerEvents {
  join_room: (payload: JoinRoomPayload, callback?: (response: JoinRoomResponse) => void) => void;
  leave_room: (payload: LeaveRoomPayload, callback?: (response: JoinRoomResponse) => void) => void;
  send_message: (
    payload: SendMessagePayload,
    callback?: (response: SendMessageResponse) => void
  ) => void;
  mark_read: (payload: MarkReadPayload, callback?: (response: MarkReadResponse) => void) => void;
  typing: (payload: TypingPayload, callback?: (response: TypingResponse) => void) => void;
}
// ----------------------------------------------------------------------
// 4. Jobs Namespace Types
// ----------------------------------------------------------------------
export interface JobLocation {
  latitude: number;
  longitude: number;
  updatedAt?: string;
}
export interface TrackingStatus {
  isTrackingEnabled: boolean;
  lastLocation?: JobLocation;
}
// Payloads
export interface JoinJobPayload {
  jobId: string;
}
export interface LeaveJobPayload {
  jobId: string;
}
export interface UpdateLocationPayload {
  jobId: string;
  latitude: number;
  longitude: number;
}
export interface StartTrackingPayload {
  jobId: string;
}
export interface StopTrackingPayload {
  jobId: string;
}
// Responses
export interface JoinJobResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  trackingStatus?: TrackingStatus;
  error?: string;
}
export interface LeaveJobResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}
export interface SimpleResponse {
  success: boolean;
  message?: string;
  error?: string;
}
// Events
export interface LocationUpdateEvent {
  type: 'LOCATION_UPDATE';
  data: {
    jobId: string;
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  timestamp: string;
}
export interface TrackingStartedEvent {
  type: 'TRACKING_STARTED';
  data: {
    jobId: string;
    artisanId: string;
  };
  timestamp: string;
}
export interface TrackingStoppedEvent {
  type: 'TRACKING_STOPPED';
  data: {
    jobId: string;
    artisanId: string;
  };
  timestamp: string;
}
// Server -> Client Events
export interface JobsServerToClientEvents {
  'location:update': (payload: LocationUpdateEvent) => void;
  'tracking:started': (payload: TrackingStartedEvent) => void;
  'tracking:stopped': (payload: TrackingStoppedEvent) => void;
  connected: (data: { connectionId: string; userId: string; timestamp: string }) => void;
  error: (data: { message: string }) => void;
}
// Client -> Server Events
export interface JobsClientToServerEvents {
  join_job: (payload: JoinJobPayload, callback?: (response: JoinJobResponse) => void) => void;
  leave_job: (payload: LeaveJobPayload, callback?: (response: LeaveJobResponse) => void) => void;
  update_location: (
    payload: UpdateLocationPayload,
    callback?: (response: SimpleResponse) => void
  ) => void;
  start_tracking: (
    payload: StartTrackingPayload,
    callback?: (response: SimpleResponse) => void
  ) => void;
  stop_tracking: (
    payload: StopTrackingPayload,
    callback?: (response: SimpleResponse) => void
  ) => void;
}
