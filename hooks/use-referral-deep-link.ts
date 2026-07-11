import { useEffect, useRef, useState } from 'react';
import { useLinkingURL } from 'expo-linking';
import { router } from 'expo-router';

import { parseReferralCode } from '@/lib/referral-link';
import { getPendingReferral, setPendingReferral } from '@/lib/pending-referral';
import { useReferralStore } from '@/store/referral-store';
import { useAuthStore } from '@/store/auth-store';

// Mounted once in `_layout.tsx`. The incoming referral URL is data to capture,
// not a navigation instruction — `register.tsx` may not be mounted yet when the
// link arrives (see docs/referral-deep-linking-plan.md), so the code is written
// to durable storage immediately. Navigating afterwards is not optional though:
// expo-router has already resolved the URL to `+not-found`, and something has to
// move the user off it.
export function useReferralDeepLink() {
  const url = useLinkingURL();
  const setCode = useReferralStore((s) => s.setCode);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hydrated = useAuthStoreHydrated();
  const hydratedFromStorage = useRef(false);

  // A code captured on a previous launch (app killed before reaching
  // register.tsx) has no `url` this session — pull it back out of storage.
  useEffect(() => {
    if (hydratedFromStorage.current) return;
    hydratedFromStorage.current = true;

    (async () => {
      const stored = await getPendingReferral();
      if (stored) setCode(stored);
    })();
  }, [setCode]);

  useEffect(() => {
    const code = parseReferralCode(url);
    if (!code) return;

    setCode(code);
    setPendingReferral(code);

    // expo-router resolves the incoming URL as a route: `/referral/CODE` matches
    // no file in `app/`, so `+not-found` — the "Oops!" screen — is already mounted
    // underneath us by the time this runs. Both branches below must therefore
    // navigate somewhere real; bailing out early strands the user there. `replace`,
    // not `navigate`, so `+not-found` doesn't stay on the back stack either.
    if (!hydrated) return; // `isLoggedIn` isn't trustworthy yet; this re-runs once it is

    // `register` is mounted for every logged-out user, onboarded or not (see the
    // guard in `_layout.tsx`), so this needs no onboarding branch — a first-time
    // user off a referral link lands on sign-up directly, code prefilled.
    router.replace(isLoggedIn ? '/' : '/register');
  }, [url, hydrated, isLoggedIn, setCode]);
}

// `useAuthStore` rehydrates asynchronously, so `isLoggedIn` can read `false` on the
// first frame of a cold start even for a signed-in user. Wait for the real value
// rather than bouncing them to sign-up.
function useAuthStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
