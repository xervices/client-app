import { useEffect, useRef } from 'react';
import { useLinkingURL } from 'expo-linking';
import { router } from 'expo-router';

import { parseReferralCode } from '@/lib/referral-link';
import { getPendingReferral, setPendingReferral } from '@/lib/pending-referral';
import { useReferralStore } from '@/store/referral-store';
import { useAuthStore } from '@/store/auth-store';

// Mounted once in `_layout.tsx`. Treats an incoming referral URL as data to
// capture, not a navigation instruction — `register.tsx` may not be mounted
// yet when the link arrives (see docs/referral-deep-linking-plan.md), so the
// code is written to durable storage immediately and navigation is only a
// best-effort nicety layered on top.
export function useReferralDeepLink() {
  const url = useLinkingURL();
  const setCode = useReferralStore((s) => s.setCode);
  const { isLoggedIn, hasCompletedOnboarding } = useAuthStore();
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

    if (isLoggedIn || !hasCompletedOnboarding) return;
    router.navigate('/register');
  }, [url, isLoggedIn, hasCompletedOnboarding, setCode]);
}
