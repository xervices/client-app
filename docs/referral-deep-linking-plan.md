# Referral Deep Linking

**Goal:** When a user shares their referral link (`https://www.getxervices.com/referral/USER202673`) and someone taps it, the app opens and the referral code is prefilled on the sign-up form — on both cold start (app not running) and warm start (app backgrounded).

**Status: client-side pipeline implemented**, scoped to links opened when the app is **already installed**. Fresh-install (deferred) attribution is explicitly out of scope — see [Explicitly out of scope](#explicitly-out-of-scope). The client work is complete but **not yet end-to-end functional**: real `https://` links won't open the app until the backend and web changes in [Backend changes required](#backend-changes-required) and [Web / static files required](#web--static-files-required-team-owned) ship.

**Status of the sharing half:** Done, pre-existing and real. `app/(tabs)/profile/promo.tsx` renders the real `referralCode` and `referralLink` from `api.getMyPromotions()` and copies them via `copyToClipboard`.

**Domain:** `https://www.getxervices.com` (the API lives on `api.getxervices.com` / `staging-api.getxervices.com`; the web/app-links domain is `www.getxervices.com` — these are different hosts and must not be confused when configuring AASA/assetlinks).

**This is the customer app.** Its sibling, the artisan app (`com.xervices.artisan`, scheme `xervices-pro`), implements the same pipeline against the `/pro/referral` prefix. The two apps share one domain, so path prefixes are disjoint — see [Two apps, one domain](#2-two-apps-one-domain).

---

## Decisions taken

| Question | Answer |
|---|---|
| Fresh install (app not yet installed) | **Out of scope.** No deferred deep linking. |
| Android Play Install Referrer | **Dropped.** `react-native-play-install-referrer` is unmaintained; not worth the native-module/rebuild risk for this pass. |
| Fingerprint-based attribution | **Rejected.** Probabilistic, and requires the backend to retain identifying signals for people who never signed up or consented. `POST /app-install` is untouched — no fingerprint signals, no matched-code response. |
| Domain sharing with the artisan app | Both apps share `getxervices.com` (via `www.getxervices.com` for links) |
| Control of `https://www.getxervices.com/.well-known/` | Yes, but not implemented here — see [Web / static files required](#web--static-files-required-team-owned) |
| Build scope for native link config | **Production build only** — dev and preview get no associated domains / intent filters |
| Apple Team ID | `G7635Z8B89` (from `eas.json` → `submit.production.ios.appleTeamId`) |

---

## Two constraints that shape everything

### 1. The deep link URL is not a route, and `+not-found` is waiting for it

There is no `app/referral/[code].tsx`. `xervices://referral/USER202673` resolves to the path `/referral/USER202673`, which matches no file in `app/`, so **expo-router mounts `app/+not-found.tsx`** — the "Oops! This screen doesn't exist" screen — before `useReferralDeepLink` ever runs. That happens on every referral link, in every auth state.

**Two things follow, and both are needed:**

1. The URL is *data to capture*, not a navigation instruction. The code is written to durable storage the instant it arrives; `register.tsx` reads it whenever it eventually mounts.
2. The hook must **also always navigate the user off `+not-found`**, in every auth state. Capturing the code is necessary but not sufficient. An early `return` on any branch strands the user on "Oops!".

> This was the original bug. The first implementation only navigated for logged-out-and-onboarded users, so that one path appeared to work while not-onboarded and already-logged-in both silently parked on the not-found screen.

### 1b. `register` is deliberately outside the onboarding guard

`register` used to sit inside `<Stack.Protected guard={!isLoggedIn && hasCompletedOnboarding}>`, so it was **not mounted** for a first-time user — a referral deep link had nowhere valid to send them. It now has its own guard:

```tsx
<Stack.Protected guard={!isLoggedIn}>
  <Stack.Screen name="register" ... />
</Stack.Protected>
```

So sign-up is reachable by *any* logged-out user, onboarded or not, and a brand-new user off a referral link lands directly on it with the code prefilled — skipping onboarding rather than being blocked by it.

**Reaching `register` marks the user onboarded** (an effect in `register.tsx` calls `completeOnboarding()`). This is load-bearing, not bookkeeping: `verify-email`, `verify-device`, `terms`, `privacy` and `login` are all still behind the `hasCompletedOnboarding` guard, so without it a referral user would sign up and then hit a dead end on the very next navigation.

Accepted trade-off: a referral user never sees the onboarding carousel. If they abandon the register screen and reopen the app, they land on `login`, not onboarding.

### 2. Two apps, one domain

Both apps claim `getxervices.com`. If both claim `/referral/*`, iOS picks one non-deterministically when both are installed, and Android shows a chooser.

**Resolution — disjoint path prefixes:**

| Path | Claimed by | Purpose |
|---|---|---|
| `/pro/referral/:code` | Artisan app | Universal / App Link |
| `/u/referral/:code` | Customer app (this repo) | Universal / App Link |
| `/referral/:code` | Nobody (web only) | Interstitial; legacy links; the path the backend currently emits |

Leaving bare `/referral/:code` unclaimed by any native app means **every link already shared keeps working** — it lands on a web page that routes the user.

---

## What was implemented (this repo)

All client-only, verifiable today via custom scheme with no backend or web dependency.

### `lib/referral-link.ts` — pure parser

```ts
export function parseReferralCode(url: string | null | undefined): string | null
```

Built on `Linking.parse()` from `expo-linking` rather than hand-rolled regex, so it matches exactly how the runtime resolves these URLs. Handles, in order:

1. Custom scheme `xervices://referral/:code` (and the `-dev` / `-prev` build variants) — `referral` lands in `hostname`, the code is the path.
2. `https://www.getxervices.com/u/referral/:code` and `/pro/referral/:code`.
3. Legacy `https://www.getxervices.com/referral/:code` — what the backend emits today.
4. `?ref=CODE` query fallback.

Validates against `/^[A-Z0-9]{4,20}$/i` and normalizes to uppercase. Deep links are untrusted input from any app on the device, so nothing unvalidated reaches the form or `POST /api/referrals/apply`. (The parser also accepts the `/pro/referral/:code` shape so the two apps can share one parser implementation verbatim.)

### `lib/pending-referral.ts` — durable capture

`setPendingReferral` / `getPendingReferral` / `clearPendingReferral` over `expo-sqlite/kv-store`, mirroring `lib/app-install.ts`. Stores a timestamp under `pending_referral_stored_at`; `getPendingReferral` self-expires anything older than 30 days. Deliberately **not** zustand-persist — must be readable at boot without waiting on the same async rehydration that the `Stack.Protected` guard races.

### `store/referral-store.ts` — reactive companion

Plain, non-persisted zustand store (`code`, `setCode`, `clearCode`) so `register.tsx` reacts if a link arrives while it's already mounted. `lib/pending-referral.ts` remains the durable source of truth; this is just the live layer on top.

### `hooks/use-referral-deep-link.ts` — mounted in `_layout.tsx`

```ts
export function useReferralDeepLink()
```

Uses `useLinkingURL()` from `expo-linking` (`useURL()` is deprecated in the installed version) — covers cold start (initial URL) and warm start (subsequent `url` events) in one hook.

On mount: reads `getPendingReferral()` once to hydrate the in-memory store from a previous launch (covers the case where the app was killed before `register.tsx` was ever reached).

On every URL change: parses it, and if a code is found, `setPendingReferral(code)` (durable) + `setCode(code)` (reactive) + navigate:

```ts
if (!hydrated) return; // `isLoggedIn` isn't trustworthy yet; this re-runs once it is
router.replace(isLoggedIn ? '/' : '/register');
```

Three things about those two lines, each of which was a bug at some point:

- **Navigation is mandatory, not a nicety** — see [constraint 1](#1-the-deep-link-url-is-not-a-route-and-not-found-is-waiting-for-it). `+not-found` is already mounted by the time this runs, so both branches must land somewhere real.
- **`replace`, not `navigate`** — otherwise `+not-found` stays on the back stack and hardware-back returns the user to "Oops!".
- **No onboarding branch is needed.** Because `register` now sits outside the onboarding guard ([1b](#1b-register-is-deliberately-outside-the-onboarding-guard)), `/register` is mounted for every logged-out user, onboarded or not — including guests, who are *not* logged in and so correctly route to sign-up.

Gated on a local `useAuthStoreHydrated()` helper. `useAuthStore` rehydrates asynchronously, so `isLoggedIn` can read `false` on the first frame of a cold start even for a signed-in user, which would bounce them to sign-up; the effect re-runs once hydration lands. The helper **re-checks `persist.hasHydrated()` inside the effect** rather than only subscribing via `onFinishHydration` — the store starts hydrating at module import, long before React mounts, so the listener may attach after hydration already finished and never fire, leaving `hydrated` stuck at `false` and no navigation ever running.

Mounted as `<ReferralDeepLinkHandler />` in `app/_layout.tsx`, beside the existing `<AppInstallTracker />`.

### `app/register.tsx` — consume

- Reads `useReferralStore((s) => s.code)`; an effect prefills `referralCode` via `form.setFieldValue` only when the field is still empty, so an arriving code never clobbers something the user typed.
- A second effect calls `completeOnboarding()` if `hasCompletedOnboarding` is false — a referral link can drop a first-time user straight here, and the screens this one hands off to are still behind that guard. See [1b](#1b-register-is-deliberately-outside-the-onboarding-guard).
- Fixed: `applyReferralCode.mutate` previously had no `onSuccess`/`onError` (it was a bare `applyReferralCode?.mutate({ referralCode })`) — a rejected code failed silently and the user believed they were credited. Now shows the error via `showErrorMessage`.
- On success, surfaces `referrerName` from `ApplyReferralResponseDto` as `"Referred by <name>"`.
- `clearPendingReferral()` + `clearReferralCode()` run on apply success, or on an apply error **that isn't a `TypeError`** (React Native's fetch throws `TypeError` on network failure, as distinct from the `Error` the API layer throws for a structured 4xx response) — so a network blip doesn't wipe out the code before it can retry.

### `app.config.ts` — native config, production build only

```ts
const DEEP_LINK_HOST = 'www.getxervices.com';
const REFERRAL_PATH_PREFIX = '/u/referral';
```

`getDynamicAppConfig('production')` now also returns:
- `associatedDomains: ['applinks:www.getxervices.com']` → spread into `ios.associatedDomains`.
- `intentFilters: [{ action: 'VIEW', autoVerify: true, data: [{ scheme: 'https', host: 'www.getxervices.com', pathPrefix: '/u/referral' }], category: ['BROWSABLE', 'DEFAULT'] }]` → spread into `android.intentFilters`.

`'development'` and `'preview'` both return `associatedDomains: undefined` and `intentFilters: undefined` — those builds keep only their custom schemes (`xervices-dev://`, `xervices-prev://`), which is enough to exercise the whole parser → capture → prefill pipeline without needing the domain claimed at all.

> Consequence to accept: an `https://www.getxervices.com/u/referral/...` link tapped on a device with only a dev/preview build installed opens the browser interstitial, not the app. Fine — end users only run the prod build.

---

## Explicitly out of scope

- **Android Play Install Referrer** (exact fresh-install attribution). `react-native-play-install-referrer` looks unmaintained, and pulling in a native module for this is a rebuild with compatibility risk against RN 0.81 / new architecture that isn't worth it for this pass. If revisited, options are: find a maintained fork, or write a thin custom Expo config plugin wrapping `com.android.installreferrer` directly.
- **Fingerprint-based attribution** (IP + user agent + screen + timezone matching). Rejected outright — probabilistic (two people on one office WiFi with the same phone model are indistinguishable) and requires the backend to retain identifying signals for people who haven't signed up or consented to anything. `POST /app-install` keeps posting `{ deviceId, platform, appVersion }` and discarding the response, unchanged.
- **iOS fresh-install attribution.** Apple provides no equivalent API; the only mechanism that survives an App Store install is the clipboard, which triggers the paste banner and reads as spyware. Accepted gap. Two non-automatic paths still work once the backend/web changes below ship: re-tapping the link post-install (resolves as a normal Universal Link), and manual entry (the interstitial can display the code; the form field already exists).

---

## Backend changes required

These are the actual blockers — without them, real `https://` links have nothing correct to point at, and the app has no correctly-shaped link to share in the first place.

### 1. Role-namespaced `referralLink` — `GET /api/referrals/me` and `GET /api/promotions/me`

Both endpoints return `referralLink`. `getMyPromotions()` is what `app/(tabs)/profile/promo.tsx` actually reads and displays. Today this is a bare shared path (e.g. `https://xervices.ng/referral/ALEX2025`, which is also the wrong domain).

**Required:**
- Domain must be `https://www.getxervices.com` — exactly this host, since iOS Universal Links and Android App Links match the host string exactly against what's in `app.config.ts` (`DEEP_LINK_HOST = 'www.getxervices.com'`).
- Path must be **role-namespaced**, not the bare `/referral/:code` it emits today:
  - Customer users → `https://www.getxervices.com/u/referral/:code`
  - Artisan users → `https://www.getxervices.com/pro/referral/:code`
- This is what makes the disjoint-prefix design in [Two apps, one domain](#2-two-apps-one-domain) actually work — without it, every shared link still points at the unclaimed `/referral/:code` path and only ever opens the web interstitial, never the app directly.

The client already parses the new `/u/referral/:code` shape (see `lib/referral-link.ts`) and falls back to the legacy bare path, so this change is backward compatible with links already shared before the rollout.

### 2. `POST /api/referrals/apply` — no change required

Confirmed working as-is. The client throws a structured `Error` on any non-2xx response and a `TypeError` only on an actual network failure; `app/register.tsx` relies on that distinction to decide whether to clear the pending code. No new fields or status codes needed.

### 3. `POST /app-install` — no change required

Explicitly **not** doing the fingerprint-signals-in / matched-`referralCode`-out contract that an earlier draft of this doc proposed. Keep it exactly as-is (`{ deviceId, platform, appVersion }` in, response discarded by the client). Do not add fingerprint fields to this endpoint — see [Explicitly out of scope](#explicitly-out-of-scope) for why.

---

## Web / static files required (team-owned)

Not implemented as part of this change (no web repo access from here) — needed to make real `https://` links resolve to the app instead of the browser. **These files are shared by both apps** — one AASA and one assetlinks file on `www.getxervices.com` list entries for both the customer and artisan apps. Whichever app ships its web changes first should include both entries.

`https://www.getxervices.com/.well-known/apple-app-site-association` — no file extension, served as `application/json`, **no redirects** (iOS follows none):

```json
{"applinks":{"details":[
  {"appIDs":["G7635Z8B89.com.xervices.client"],"components":[{"/":"/u/referral/*"}]},
  {"appIDs":["G7635Z8B89.com.xervices.artisan"],"components":[{"/":"/pro/referral/*"}]}
]}}
```

Team ID `G7635Z8B89` is shared by both apps (both repos' `eas.json` → `submit.production.ios.appleTeamId`). The customer app's production bundle ID is `com.xervices.client`.

`https://www.getxervices.com/.well-known/assetlinks.json` — no file extension, served as `application/json`. One array entry per app, each needs `sha256_cert_fingerprints` for **both** the upload cert and the Play App Signing cert:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.xervices.client",
      "sha256_cert_fingerprints": [
        "UPLOAD_KEY_SHA256_FINGERPRINT",
        "PLAY_APP_SIGNING_SHA256_FINGERPRINT"
      ]
    }
  },
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.xervices.artisan",
      "sha256_cert_fingerprints": [
        "UPLOAD_KEY_SHA256_FINGERPRINT",
        "PLAY_APP_SIGNING_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

`package_name` is the **production** package (`PACKAGE_NAME` in `app.config.ts` — `com.xervices.client`, no `.dev`/`.preview` suffix), since only production claims the domain. The artisan entry's fingerprints come from that repo's own keystore/Play Console — they are different from this app's.

Two fingerprints are needed per app because two different signing paths reach a device:
- The **upload cert** signs `production-apk` builds (`build:android:prod-apk` in `package.json`) distributed outside Play — those are never re-signed by Google, so the device only ever sees the upload cert.
- The **Play App Signing cert** is what Google re-signs your AAB with before distributing it through the Play Store — that's what a device that installed from Play actually sees.

**Getting the upload cert SHA-256** (EAS manages this project's keystore — no local `credentials.json` in this repo):

1. From the client-app repo root, run `eas credentials`.
2. Select platform `Android`.
3. Select the `production` build profile.
4. Choose the keystore management option (wording varies by `eas-cli` version, something like "Keystore: Manage everything needed to build your project" → view/download credentials).
5. EAS prints the keystore details, including `SHA1 Fingerprint` and `SHA256 Fingerprint` — copy the SHA256 one.
6. Repeat in the **artisan app repo** for its own production keystore.

**Getting the Play App Signing cert SHA-256** (Play Console, per app):

1. Go to [Play Console](https://play.google.com/console) and open the app.
2. Left nav → **Setup → App integrity** (older Play Console UIs call this "App signing").
3. Under **App signing key certificate** (not "Upload key certificate" — that one just duplicates the EAS upload cert above), copy the **SHA-256 certificate fingerprint**.
4. Repeat for the artisan app's Play Console listing.

> This cert only exists once the app has had at least one release go through Play Console (Play enrolls new apps in Play App Signing automatically on first upload). If the app hasn't been submitted yet, this step blocks on that first release existing.

> Missing the Play App Signing cert is the usual reason verification passes in internal testing (sideloaded APK, upload cert only) and fails in production (Play-distributed, App Signing cert).

`https://www.getxervices.com/referral/:code` — the interstitial page for the legacy/unclaimed path. Since fresh-install attribution is out of scope, this no longer needs to record fingerprints or embed a Play Store `referrer` param — it just needs to route the visitor (open the app via custom scheme if installed, otherwise link to the store) and, for iOS visitors, display the code prominently for manual entry: *"Your referral code is USER202673 — enter it when you sign up."*

---

## Verifying it

Cold start is `getInitialURL()`, warm start is the `url` event; `useLinkingURL()` gives both. The `+not-found` interception described in [constraint 1](#1-the-deep-link-url-is-not-a-route-and-not-found-is-waiting-for-it) reproduces on **both** cold and warm start; the not-onboarded state behind it needs cleared storage.

Because the native link config is prod-gated, testing splits cleanly in two:

**In dev/preview — the app-side pipeline, via the custom scheme (works today):**

```bash
# Android dev build
npx uri-scheme open "xervices-dev://referral/USER202673" --android

# iOS simulator, dev build
xcrun simctl openurl booted "xervices-dev://referral/USER202673"
```

This exercises everything client-side: parse → persist → prefill, across all four states below. The `https://` host/path handling in `parseReferralCode` is covered by the same parser and can be unit tested directly.

**On a prod build, once the backend + web changes above ship — the `https://` handoff:**

```bash
# Android (production-apk build installed)
npx uri-scheme open "https://www.getxervices.com/u/referral/USER202673" --android

# Android App Links verification status
adb shell pm get-app-links com.xervices.client
```

iOS requires a **real device** with a TestFlight (or App Store) build — the simulator doesn't enforce AASA the way a device does, and no dev/preview build claims the domain at all.

The four states that matter — in each of the first three, confirm the "Oops! This screen doesn't exist" screen is never left on display, and that hardware-back doesn't return to it:

1. Logged out + onboarded (incl. guest) → replaces to register, prefilled
2. Logged out + **not** onboarded → replaces to register, prefilled, onboarding skipped and marked complete
3. Already logged in → replaces to tabs home (`/`), no prefill
4. App not installed → **not handled** (out of scope — see above)

**Testing on an Android dev build without `adb`:** custom-scheme links can't be fired with `npx uri-scheme open` (it shells out to `adb`). Instead, serve a page with an `<a href="xervices-dev://referral/USER202673">` on the LAN and tap it in Chrome on the device — Chrome hands the custom scheme off to the app exactly like a real link would. To reach state 2, clear storage via Settings → Apps → Xervices Development → Storage → Clear data.

---

## Status

| Step | Status |
|---|---|
| Parser + capture pipeline (`referral-link.ts`, `pending-referral.ts`, `referral-store.ts`, `use-referral-deep-link.ts`) | **Done** |
| `register.tsx` consumption + the silent-apply fix | **Done** |
| Routing off `+not-found` in every auth state; `register` outside the onboarding guard | **Done** — verified on an Android dev build |
| Native config (`app.config.ts`, prod-gated) | **Done** |
| Role-namespaced `referralLink` (backend) | **Not started** — blocks correctly-shaped outbound links |
| `.well-known` files + interstitial (web team) | **Not started** — blocks real `https://` links from opening the app |
| Deferred attribution (Play Install Referrer / fingerprinting) | **Dropped**, not planned |

Step 1 is independently verifiable today on a dev build: `npx uri-scheme open "xervices-dev://referral/USER202673"`.

---

## Notes

- The sharing UI (`app/(tabs)/profile/promo.tsx`) is real and wired to `getMyPromotions()` — unlike the artisan app's stale `promo.tsx`, this one already renders live `referralCode` / `referralLink` and copies them. Once the backend emits the role-namespaced `/u/referral/:code` link, the "Copy" button here shares the correct app-opening URL with no further client change.
- The screen offers copy but no native `Share.share()` sheet — the natural way a user actually sends the link. Optional enhancement, not required for the pipeline.
