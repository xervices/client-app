# Xervices — User Stories

This document captures the user-facing functionality of the Xervices client app (the customer-side mobile application). It is derived directly from the screens, API integrations, sockets, and stores in this codebase. The companion artisan/provider experience lives in a separate "Xervices Pro" app.

The app is a **service-marketplace platform** where customers ("users") describe a job, receive offers from vetted providers ("artisans"), negotiate, pay through escrow, track delivery in real time, and rate/raise disputes afterwards.

Personas:

- **Guest** — has launched the app but has not signed in. Can browse limited content and is prompted to sign in to perform actions.
- **User (Customer)** — authenticated account that books services.
- **Returning user** — has previously completed onboarding and signed in on this device.

---

## 1. Onboarding & First Launch

### 1.1 See the value proposition the first time I open the app
- **As a** first-time user
- **I want** to see a short carousel explaining verified professionals, escrow payments, and real-time tracking
- **So that** I understand what the app does before I commit to creating an account
- **Notes:** [app/onboarding.tsx](app/onboarding.tsx) — 3 auto-advancing slides, persisted via `hasCompletedOnboarding` in [store/auth-store.ts](store/auth-store.ts).

### 1.2 Skip onboarding on subsequent launches
- **As a** returning user
- **I want** the onboarding slides to not appear again
- **So that** I get straight to the app

### 1.3 Continue as a guest
- **As a** visitor who is not ready to register
- **I want** to enter the app without an account
- **So that** I can browse categories, featured providers, and promotions before deciding to sign up
- **Notes:** Guest mode is controlled by `isGuest` in the auth store; protected stacks in [app/_layout.tsx](app/_layout.tsx) gate sensitive flows behind `isLoggedIn`.

---

## 2. Authentication

### 2.1 Create an account with email + phone
- **As a** new user
- **I want** to register with my full name, email, phone number, password, and an optional referral code
- **So that** I can start booking services
- **Notes:** [app/register.tsx](app/register.tsx) → `POST /api/auth/register`.

### 2.2 Sign in with email/phone + password
- **As a** registered user
- **I want** to log in with my email or phone number
- **So that** I can access my account and jobs
- **Notes:** [app/login.tsx](app/login.tsx) → `POST /api/auth/login`. Device id/name are submitted for trusted-device handling.

### 2.3 Verify a new device
- **As a** user logging in from an unrecognized device
- **I want** to confirm an OTP sent to my email or phone
- **So that** my account stays secure
- **Notes:** [app/verify-device.tsx](app/verify-device.tsx) → `POST /api/auth/verify-device`.

### 2.4 Verify my email address
- **As a** newly registered user
- **I want** to enter a verification code sent to my email
- **So that** my account is activated
- **Notes:** [app/verify-email.tsx](app/verify-email.tsx) → `POST /api/auth/verify`, resend via `POST /api/auth/resend-verification`.

### 2.5 Sign in with Google or Apple
- **As a** user who prefers SSO
- **I want** to use Google Sign-In or Apple Sign-In
- **So that** I do not have to manage another password
- **Notes:** [components/google-signin-button.tsx](components/google-signin-button.tsx), [components/apple-signin-button.tsx](components/apple-signin-button.tsx) → `POST /api/auth/google/mobile`, `POST /api/auth/apple/mobile`.

### 2.6 Recover a forgotten password
- **As a** user who cannot remember my password
- **I want** to request a reset code, confirm it, and choose a new password
- **So that** I can regain access
- **Notes:** [app/forgot-password.tsx](app/forgot-password.tsx), [app/forgot-password-otp.tsx](app/forgot-password-otp.tsx), [app/new-password.tsx](app/new-password.tsx).

### 2.7 Stay signed in across sessions
- **As a** returning user
- **I want** my session to be restored when I reopen the app
- **So that** I do not have to log in every time
- **Notes:** Access/refresh tokens persisted in [api/token-storage.ts](api/token-storage.ts); silent refresh in [api/client.ts](api/client.ts) within 5 min of expiry, plus 401 retry.

### 2.8 Be told clearly when my session expires
- **As a** user whose refresh fails
- **I want** a single non-spammy toast that says "Session expired, please login again"
- **So that** I understand why I was logged out

### 2.9 Get redirected back to where I was after logging in
- **As a** guest who tapped a login-required action
- **I want** to land back on that screen after authentication
- **So that** my flow is not interrupted
- **Notes:** `pendingRedirect` in [store/auth-store.ts](store/auth-store.ts).

---

## 3. Home

### 3.1 See an overview when I open the app
- **As a** user
- **I want** the home screen to show categories, my active jobs, featured providers, and current promotions
- **So that** I can quickly book or resume something
- **Notes:** [app/(tabs)/(home)/index.tsx](app/(tabs)/(home)/index.tsx).

### 3.2 Search for a service category
- **As a** user with a specific need in mind
- **I want** to type or pick from popular searches
- **So that** I can jump straight into booking
- **Notes:** [components/home/search-input.tsx](components/home/search-input.tsx), categories from `GET /api/categories`.

### 3.3 See "User of the Week"
- **As a** user looking for inspiration
- **I want** to browse featured profiles
- **So that** I can discover top providers
- **Notes:** `GET /api/featured-profiles?type=user`.

### 3.4 See news and promotional slides
- **As a** user
- **I want** dismissible promotional banners and broadcasts
- **So that** I am aware of discounts and announcements
- **Notes:** `GET /api/promotion-slides`, `GET /api/broadcasts/active`, dismiss via `POST /api/broadcasts/{id}/dismiss`.

### 3.5 Pull to refresh
- **As a** user
- **I want** to swipe down to refresh the home screen
- **So that** I always see fresh data

### 3.6 Receive push notifications
- **As a** user
- **I want** the app to register my Expo push token after login
- **So that** I get notified about offers, messages, status changes, and disputes
- **Notes:** [providers/notification-provider.tsx](providers/notification-provider.tsx), `POST /api/notifications/devices`.

---

## 4. Booking a Service (3-Step Flow)

### 4.1 Pick a category (Step 1)
- **As a** user
- **I want** to choose the category that best fits my need
- **So that** the right providers are matched
- **Notes:** [app/(tabs)/book/(service)/index.tsx](app/(tabs)/book/(service)/index.tsx), persisted in [store/service-store.ts](store/service-store.ts).

### 4.2 Describe the job (Step 2)
- **As a** user
- **I want** to enter a title, description, and attach photos or short videos
- **So that** providers can quote accurately
- **Notes:** [app/(tabs)/book/(service)/step-2.tsx](app/(tabs)/book/(service)/step-2.tsx); media captured via [components/sheets/camera-sheet.tsx](components/sheets/camera-sheet.tsx) and Expo Image Picker.

### 4.3 Provide service location and contact phone (Step 3)
- **As a** user
- **I want** to pick the address on a map, optionally add a destination address (e.g. for delivery/moving jobs), and confirm the contact phone
- **So that** providers can reach the right place
- **Notes:** [app/(tabs)/book/(service)/step-3.tsx](app/(tabs)/book/(service)/step-3.tsx), [components/sheets/location-map-search-sheet.tsx](components/sheets/location-map-search-sheet.tsx), `requiresDestination` toggle.

### 4.4 Submit and wait for matching artisans
- **As a** user who completed the form
- **I want** to see a "Searching" screen while nearby artisans are matched
- **So that** I know the system is working
- **Notes:** [components/screens/searching.tsx](components/screens/searching.tsx), `GET /api/service-requests/{id}/matching-artisans`.

### 4.5 See a "no result" screen if no one matches
- **As a** user whose request couldn't be matched
- **I want** clear guidance on what to do next (retry, broaden, cancel)
- **So that** I am not left stuck
- **Notes:** [components/screens/no-result.tsx](components/screens/no-result.tsx).

### 4.6 Cancel a service request before it becomes a job
- **As a** user who changed my mind
- **I want** to cancel the request with an optional reason
- **So that** providers stop being asked to bid
- **Notes:** `POST /api/service-requests/{id}/cancel`, see [components/sheets/cancel-service-sheet.tsx](components/sheets/cancel-service-sheet.tsx) and [components/screens/cancellation-policy.tsx](components/screens/cancellation-policy.tsx).

---

## 5. Offers & Negotiation

### 5.1 View incoming offers for my request
- **As a** user with an open request
- **I want** to see each artisan's price, profile, ratings, and verification badges
- **So that** I can compare
- **Notes:** [components/screens/offer.tsx](components/screens/offer.tsx), `GET /api/offers/service-request/{id}`, live updates via [providers/offers-context.tsx](providers/offers-context.tsx) + [hooks/use-offers-socket.ts](hooks/use-offers-socket.ts).

### 5.2 View an artisan's full profile
- **As a** user considering an offer
- **I want** to open the artisan's profile to read reviews and stats
- **So that** I can decide whether to accept
- **Notes:** [components/screens/pro.tsx](components/screens/pro.tsx), `GET /api/reviews/artisan/{id}`, `GET /api/reviews/artisan/{id}/stats`.

### 5.3 Accept or decline an offer
- **As a** user reviewing offers
- **I want** to accept the offer I want or decline the rest
- **So that** the job can move forward
- **Notes:** `POST /api/offers/{id}/respond`.

### 5.4 Send a counter-offer
- **As a** user who finds an offer too high
- **I want** to propose a different amount with a message
- **So that** I can negotiate
- **Notes:** [components/sheets/counter-offer-sheet.tsx](components/sheets/counter-offer-sheet.tsx), `POST /api/offers/{id}/counter`.

### 5.5 Apply a promo code or referral reward to an offer
- **As a** user with a code
- **I want** to validate and apply a promo code at the offer-confirmation step
- **So that** I pay less
- **Notes:** [components/sheets/add-promo-code-sheet.tsx](components/sheets/add-promo-code-sheet.tsx), `POST /api/promotions/validate-promo-code`, `POST /api/promotions/apply-promo-code`, `POST /api/promotions/remove-promo-code`, `POST /api/referrals/use-reward`.

### 5.6 Confirm the booking and pay
- **As a** user accepting an offer
- **I want** to confirm the agreed amount and pay through Paystack
- **So that** funds are held in escrow until I approve the job
- **Notes:** [components/screens/confirm.tsx](components/screens/confirm.tsx), [components/sheets/paystack-webview-sheet.tsx](components/sheets/paystack-webview-sheet.tsx), `POST /api/payments/initialize`, `POST /api/payments/verify`.

---

## 6. Jobs (Active & Completed)

### 6.1 See my jobs in progress and completed
- **As a** user
- **I want** a tabbed list of jobs grouped by status
- **So that** I can track ongoing work and revisit history
- **Notes:** [app/(tabs)/jobs/index.tsx](app/(tabs)/jobs/index.tsx), [app/(tabs)/jobs/completed.tsx](app/(tabs)/jobs/completed.tsx), `GET /api/jobs`.

### 6.2 Open a job to see details and timeline
- **As a** user with an active job
- **I want** to see the artisan, status, before/after evidence, and a map
- **So that** I know what is happening
- **Notes:** [app/ongoing.tsx](app/ongoing.tsx), `GET /api/jobs/{id}`.

### 6.3 Track the artisan in real time
- **As a** user waiting for an artisan
- **I want** to see them moving on a map with an ETA
- **So that** I know when to be ready
- **Notes:** [hooks/use-jobs-socket.ts](hooks/use-jobs-socket.ts), `GET /api/jobs/{id}/artisan-location`, Google Maps Directions for ETA via [lib/utils.ts](lib/utils.ts).

### 6.4 Call the artisan
- **As a** user
- **I want** a one-tap call button
- **So that** I can reach the artisan quickly

### 6.5 Inspect before/after photos
- **As a** user reviewing the work
- **I want** to compare evidence uploaded by the artisan
- **So that** I can verify quality before releasing payment
- **Notes:** [app/(tabs)/jobs/photo-preview.tsx](app/(tabs)/jobs/photo-preview.tsx), [components/sheets/image-preview-sheet.tsx](components/sheets/image-preview-sheet.tsx).

### 6.6 Approve a completed job to release escrow
- **As a** user satisfied with the work
- **I want** to approve so funds are released
- **So that** the artisan gets paid
- **Notes:** `POST /api/jobs/{id}/approve`.

### 6.7 Cancel a job that is already in progress
- **As a** user whose plans changed
- **I want** to cancel with a reason, subject to the cancellation policy
- **So that** the agreement is closed cleanly
- **Notes:** `POST /api/jobs/{id}/cancel`.

---

## 7. Chat

### 7.1 Chat with the artisan for a specific job
- **As a** user
- **I want** a 1:1 chat tied to the job, with typing indicators and instant delivery
- **So that** I can coordinate logistics
- **Notes:** [app/chat.tsx](app/chat.tsx), `GET /api/chat/jobs/{jobId}`, `GET /api/chat/rooms/{id}/messages`, `POST /api/chat/rooms/{id}/messages`, realtime via [hooks/use-chat-socket.ts](hooks/use-chat-socket.ts).

### 7.2 Send images in chat
- **As a** user
- **I want** to attach photos to chat messages
- **So that** I can clarify the request visually

---

## 8. Ratings & Reviews

### 8.1 Rate the artisan after a job
- **As a** user whose job just finished
- **I want** to leave a star rating and review
- **So that** future users can decide
- **Notes:** [app/rate.tsx](app/rate.tsx), [components/screens/rate.tsx](components/screens/rate.tsx), `POST /api/reviews`.

### 8.2 Rate the app itself
- **As a** user
- **I want** to give the app a rating
- **So that** the team gets feedback
- **Notes:** `POST /api/app-ratings`, `GET /api/app-ratings/me`.

---

## 9. Disputes

### 9.1 Open a dispute on a job
- **As a** user dissatisfied with the work
- **I want** to file a dispute with a category, description, and photo/video evidence
- **So that** support can investigate
- **Notes:** [app/dispute.tsx](app/dispute.tsx), [components/screens/create-dispute.tsx](components/screens/create-dispute.tsx), `POST /api/disputes`.

### 9.2 Track my disputes
- **As a** user
- **I want** a list and a detail view for each dispute
- **So that** I can follow the resolution
- **Notes:** [app/(tabs)/profile/disputes.tsx](app/(tabs)/profile/disputes.tsx), [app/(tabs)/profile/dispute-detail.tsx](app/(tabs)/profile/dispute-detail.tsx), `GET /api/disputes`, `GET /api/disputes/{id}`.

### 9.3 Add more evidence to an existing dispute
- **As a** user with new evidence
- **I want** to attach it to my open dispute
- **So that** support has the latest information
- **Notes:** `POST /api/disputes/{id}/evidence`.

---

## 10. Profile, Promotions & Account

### 10.1 View and edit my personal details
- **As a** user
- **I want** to update my name, avatar, address, bio, and location fields
- **So that** providers and the app have the right information
- **Notes:** [app/(tabs)/profile/personal.tsx](app/(tabs)/profile/personal.tsx), `GET /api/users/me`, `PATCH /api/users/me` (multipart).

### 10.2 Change my password
- **As a** logged-in user
- **I want** to change my password with OTP verification
- **So that** my account stays secure
- **Notes:** [app/(tabs)/profile/password.tsx](app/(tabs)/profile/password.tsx), [app/(tabs)/profile/password-otp.tsx](app/(tabs)/profile/password-otp.tsx), [app/(tabs)/profile/new-password.tsx](app/(tabs)/profile/new-password.tsx), `POST /api/auth/change-password`.

### 10.3 View my discounts, referral code, and promo codes
- **As a** user
- **I want** a single screen to see active discounts, my referral link, and saved promo codes
- **So that** I know what I can use
- **Notes:** [app/(tabs)/profile/promo.tsx](app/(tabs)/profile/promo.tsx), `GET /api/promotions/discounts`, `GET /api/promotions/me`, `GET /api/promotions/promo-codes`, `GET /api/referrals/me`.

### 10.4 Apply a referral code
- **As a** new user invited by someone
- **I want** to enter their code
- **So that** we both earn a reward
- **Notes:** `POST /api/referrals/apply`.

### 10.5 Read legal documents
- **As a** user
- **I want** to view Terms, Privacy Policy, Cancellation Policy, and About content
- **So that** I understand the rules
- **Notes:** [app/(tabs)/profile/policies.tsx](app/(tabs)/profile/policies.tsx), [app/(tabs)/profile/about.tsx](app/(tabs)/profile/about.tsx), powered by `GET /api/privacy-policy`, `/api/terms-and-conditions`, `/api/cancellation-policy`, `/api/about-xervices`, rendered via [components/html-content.tsx](components/html-content.tsx).

### 10.6 Contact support
- **As a** user needing help
- **I want** to email support, open a WhatsApp link, or submit a ticket
- **So that** I get help fast
- **Notes:** [app/(tabs)/profile/support.tsx](app/(tabs)/profile/support.tsx), [app/(tabs)/profile/contact-support.tsx](app/(tabs)/profile/contact-support.tsx), [app/(tabs)/profile/mail-support.tsx](app/(tabs)/profile/mail-support.tsx), `POST /api/support/tickets`, `GET /api/support/whatsapp-links`.

### 10.7 Log out
- **As a** user
- **I want** to sign out from the profile screen
- **So that** my session ends on this device
- **Notes:** `POST /api/auth/logout`, unregisters the push token first.

### 10.8 Delete my account
- **As a** user leaving the platform
- **I want** to permanently delete my account with confirmation
- **So that** my data is removed
- **Notes:** [components/sheets/delete-account-sheet.tsx](components/sheets/delete-account-sheet.tsx), `DELETE /api/users/me`.

---

## 11. Notifications

### 11.1 See all my notifications
- **As a** user
- **I want** a notifications inbox grouped chronologically
- **So that** I do not miss anything
- **Notes:** [app/(tabs)/(home)/notification.tsx](app/(tabs)/(home)/notification.tsx), `GET /api/notifications`.

### 11.2 See an unread badge
- **As a** user
- **I want** the unread count visible at a glance
- **So that** I know when something new arrived
- **Notes:** `GET /api/notifications/unread-count`, refreshed via the notification socket in [hooks/use-notification-socket.ts](hooks/use-notification-socket.ts) and [providers/notification-socket-provider.tsx](providers/notification-socket-provider.tsx).

### 11.3 Mark all as read
- **As a** user
- **I want** a single action to clear unread state
- **So that** the badge resets
- **Notes:** `POST /api/notifications/mark-all-read`.

### 11.4 Receive push notifications even when the app is closed
- **As a** user
- **I want** notifications to arrive through Expo/FCM/APNs
- **So that** I do not need the app open to know about offers and updates

---

## 12. Permissions & Device

### 12.1 Grant location access on demand
- **As a** user creating a request or tracking a job
- **I want** a clear in-context dialog explaining why location is needed
- **So that** I can grant the permission knowingly
- **Notes:** [components/enable-location-dialog.tsx](components/enable-location-dialog.tsx).

### 12.2 Grant camera/microphone access on demand
- **As a** user attaching photos/videos to a request or dispute
- **I want** a clear in-context dialog
- **So that** I understand why
- **Notes:** [components/camera-permission-dialog.tsx](components/camera-permission-dialog.tsx), [components/recording-indicator.tsx](components/recording-indicator.tsx).

### 12.3 Be auto-updated via EAS Updates
- **As a** user
- **I want** the app to fetch over-the-air updates seamlessly
- **So that** I get fixes and features without going to the store
- **Notes:** `expo-updates` configured in [app.config.ts](app.config.ts).

---

## Cross-cutting non-functional expectations

- **Resilience:** Token auto-refresh, single-flighted; 401 → refresh → retry once.
- **Realtime:** Three Socket.IO channels — offers, jobs (artisan location + status), chat (messages + typing) — all auto-reconnect and re-authenticate.
- **Offline-friendly storage:** Auth state, onboarding state, and tokens persist in SQLite via `expo-sqlite/kv-store`.
- **Multi-environment:** `development`, `preview`, and `production` builds get distinct bundle IDs, schemes, Google Services files, and an icon badge in non-prod builds — see [app.config.ts](app.config.ts) and [eas.json](eas.json).
- **Accessibility:** Custom tab bar exposes accessibility roles and labels; primary actions are large pressables with haptic feedback on auth flows.
