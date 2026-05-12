# Xervices — Client App

The **customer-facing** mobile app for [Xervices](https://getxervices.com), a service marketplace that connects users with vetted artisans. Users describe a job, receive offers, negotiate, pay through escrow, track delivery in real time, and rate or dispute the work afterwards.

> Built with React Native + Expo (managed workflow, New Architecture, Expo Router 6). Scaffolded from the React Native Reusables `expo-sample` template.

The artisan-facing experience lives in a separate **Xervices Pro** app and is not part of this repository.

For a feature-by-feature breakdown of what the app does from the user's perspective, see [USER_STORIES.md](USER_STORIES.md).

---

## Stack

| Concern             | Library                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| Framework           | [Expo](https://expo.dev/) `~54`, React Native `0.81`, React `19`                     |
| Routing             | [`expo-router`](https://expo.github.io/router) (file-based, typed routes)            |
| Styling             | [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/) |
| UI primitives       | [`@rn-primitives/*`](https://github.com/founded-labs/react-native-reusables), Lucide icons |
| Forms               | [`@tanstack/react-form`](https://tanstack.com/form) + [Zod](https://zod.dev/)        |
| Server state        | [`@tanstack/react-query`](https://tanstack.com/query)                                |
| Local state         | [Zustand](https://github.com/pmndrs/zustand) (persisted via `expo-sqlite/kv-store`)  |
| API client          | [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/) against a typed OpenAPI schema |
| Realtime            | [`socket.io-client`](https://socket.io/) — offers, jobs, chat, notifications         |
| Maps                | `react-native-maps` + Google Maps (Directions API for ETA)                           |
| Payments            | Paystack via in-app WebView                                                          |
| Auth providers      | Email/phone + OTP, Google Sign-In, Apple Sign-In                                     |
| OTA updates         | [EAS Update](https://docs.expo.dev/eas-update/introduction/)                         |
| Push notifications  | `expo-notifications` (FCM on Android, APNs on iOS)                                   |

---

## Repository layout

```
api/                  openapi-fetch client, generated schema, token storage, helpers
app/                  expo-router screens (route segments)
  (tabs)/             Bottom-tab stack: Home, Jobs, Book, Profile
    (home)/           Home tab — categories, promotions, featured profiles, notifications
    book/(service)/   3-step booking flow
    jobs/             Active/completed jobs, photo preview, rating, disputes
    profile/          Personal details, password, promos, policies, support
  _layout.tsx         Root layout, providers, route protection guards
  onboarding.tsx      First-launch slides
  login.tsx, register.tsx, verify-*, forgot-password*, new-password.tsx
  ongoing.tsx         Live job tracking (map + bottom sheet)
  chat.tsx, dispute.tsx, rate.tsx, photo-preview.tsx
assets/               Fonts (Cabinet Grotesk), icons, images
components/
  home/               Home-screen building blocks
  screens/            Reusable full-screen modules (offer, confirm, pro, rate, ...)
  sheets/             Bottom action sheets (camera, location, paystack, cancel, ...)
  ui/                 Design-system primitives (button, input, dialog, tabs, ...)
hooks/                Socket hooks (chat, jobs, offers, notifications), timer
lib/                  Theme, formatters, device info, mapping utilities
providers/            Query, notification, notification-socket, offers contexts
store/                Zustand stores: auth, service-form, static data
app.config.ts         Per-env Expo config (dev / preview / production)
eas.json              EAS Build & Submit profiles
orval.config.ts       Reserved for OpenAPI codegen
tailwind.config.js    Design tokens, font families, color palette
```

---

## Getting started

### Prerequisites

- Node.js 20+
- `pnpm` 9+
- Xcode (iOS), Android Studio + SDK (Android)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm i -g eas-cli`)
- An Expo account with access to the `xervices` org

### Install

```bash
pnpm install
```

### Run the dev server

```bash
pnpm dev          # or: pnpm start
pnpm ios          # build & run iOS simulator (uses dev-client)
pnpm android      # build & run Android emulator
pnpm web          # web (limited; many native modules are unsupported)
```

> This project uses `expo-dev-client`, so you need a **development build** installed on the device/simulator. Run `pnpm build:android:dev` or `pnpm build:ios:dev` once to produce one.

### Regenerate the API types

```bash
pnpm generate:schema
```

Fetches the OpenAPI spec from `https://staging-api.getxervices.com/api/docs-json` and writes [api/schema.ts](api/schema.ts). Commit the result.

---

## Environments

Three environments are wired end-to-end (Expo config, EAS profile, Google Services, app icon badge):

| Env           | Bundle / Package suffix   | Scheme         | Google Services                                     |
| ------------- | ------------------------- | -------------- | --------------------------------------------------- |
| `development` | `com.xervices.client.dev` | `xervices-dev` | `dev-google-services.json` / `dev-service-account.json`   |
| `preview`     | `com.xervices.client.preview` | `xervices-prev` | `preview-google-services.json` / `preview-service-account.json` |
| `production`  | `com.xervices.client`     | `xervices`     | `prod-google-services.json` / `prod-service-account.json` |

The active environment is chosen by the `APP_ENV` env var, set in [eas.json](eas.json) per profile. Dev and preview builds carry an icon banner + version ribbon (see `app-icon-badge` config in [app.config.ts](app.config.ts)).

The API base URL defaults to `https://staging-api.getxervices.com` and can be overridden with `EXPO_PUBLIC_API_URL`. Production points at `https://api.getxervices.com`.

---

## Build & release

```bash
# Dev builds (install on device, use with `pnpm dev`)
pnpm build:android:dev
pnpm build:ios:dev

# Preview / internal distribution
pnpm build:android:preview
pnpm build:ios:preview

# Production
pnpm build:android            # AAB for Play Store
pnpm build:android:prod-apk   # APK for sideloading
pnpm build:ios                # for App Store / TestFlight

# OTA updates
pnpm update                   # both platforms, production channel
pnpm update:android:preview   # android preview channel
pnpm update:ios:preview       # ios preview channel
```

App version is the single source of truth in [package.json](package.json). Bump it with:

```bash
pnpm patch   # 0.1.x → 0.1.x+1
pnpm minor
pnpm major
```

EAS uses `appVersionSource: "remote"` so build numbers auto-increment server-side.

---

## Architecture notes

### Route protection

[app/_layout.tsx](app/_layout.tsx) uses `Stack.Protected` guards driven by the auth store:

- `(tabs)` → `isLoggedIn || isGuest`
- chat / ongoing / dispute / rate / photo-preview → `isLoggedIn` only
- login / register / forgot-password / terms / privacy → `!isLoggedIn && hasCompletedOnboarding`
- onboarding → `!hasCompletedOnboarding`

Guest mode lets unauthenticated users browse the home tab; protected actions set `pendingRedirect` and route through login.

### API client & auth

[api/client.ts](api/client.ts) wraps `openapi-fetch` with two middlewares:

- **authMiddleware** — attaches the access token, proactively refreshes within 5 min of expiry, single-flights concurrent refreshes, and retries 401s once after refresh.
- **roleMiddleware** — `publicApiClient` only adds the `X-Active-Role` header (no auth).

Tokens live in [api/token-storage.ts](api/token-storage.ts) on top of `expo-sqlite/kv-store`. The `useAuthStore` is invalidated and the user shown a single toast if the refresh fails.

### Realtime

Four Socket.IO channels, each with its own hook and reconnection handling:

| Channel       | Hook                                                                | Purpose                                           |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| Offers        | [hooks/use-offers-socket.ts](hooks/use-offers-socket.ts)            | Live offers on an open service request            |
| Jobs          | [hooks/use-jobs-socket.ts](hooks/use-jobs-socket.ts)                | Artisan location stream + job status events       |
| Chat          | [hooks/use-chat-socket.ts](hooks/use-chat-socket.ts)                | Messages, typing indicators                       |
| Notifications | [hooks/use-notification-socket.ts](hooks/use-notification-socket.ts) | Unread count + foreground push echo               |

### State management

- **Auth** — [store/auth-store.ts](store/auth-store.ts), persisted (user, isLoggedIn, isGuest, hasCompletedOnboarding).
- **Booking form** — [store/service-store.ts](store/service-store.ts), ephemeral.
- **Server state** — TanStack Query (`getUserJobs`, `getOffers`, etc.) — see [api/index.ts](api/index.ts) for the full catalogue of query/mutation factories.

### Styling

Nativewind + Tailwind. Theme tokens live in [tailwind.config.js](tailwind.config.js) and [lib/theme.ts](lib/theme.ts). The Cabinet Grotesk family is loaded via `expo-font` (see [app.config.ts](app.config.ts)).

---

## Adding UI components

```bash
npx react-native-reusables/cli@latest add input textarea
```

Without arguments you'll be prompted interactively. Pass `--all` for everything.

---

## Setting up a fresh environment (FCM / push)

1. Create the project on Expo and copy the EAS project ID into [app.config.ts](app.config.ts).
2. Set environment variables for each profile on EAS (`eas env:create`).
3. Follow https://docs.expo.dev/push-notifications/fcm-credentials/ to wire FCM credentials for dev, preview, and production.
4. Drop the matching `*-google-services.json` and `*-service-account.json` files at the repo root (already gitignored as appropriate).

---

## Conventions

- TypeScript strict; OpenAPI types are the source of truth for request/response shapes — never hand-write `paths` interfaces.
- Forms use `@tanstack/react-form` + Zod schemas; error UI is rendered via `<InputError>`.
- Long-running side effects (location, sockets, notifications) live in context providers under [providers/](providers/) so screens stay declarative.
- Bottom sheets are registered once in [components/sheets/index.tsx](components/sheets/index.tsx) and triggered with `SheetManager.show(...)`.

---

## Useful references

- [Expo docs](https://docs.expo.dev/)
- [Expo Router docs](https://expo.github.io/router)
- [Nativewind docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)
- [TanStack Query](https://tanstack.com/query)
- [openapi-fetch](https://openapi-ts.dev/openapi-fetch/)
- [EAS Build](https://docs.expo.dev/build/introduction/) · [EAS Update](https://docs.expo.dev/eas-update/introduction/) · [EAS Submit](https://docs.expo.dev/submit/introduction/)
