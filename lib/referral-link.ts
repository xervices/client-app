import * as Linking from 'expo-linking';

const CODE_PATTERN = /^[A-Z0-9]{4,20}$/;

function normalize(candidate: string | undefined | null): string | null {
  if (!candidate) return null;
  const code = candidate.trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

/**
 * Extracts a referral code from any URL that could plausibly open the app:
 * `https://www.getxervices.com/u/referral/:code`, the legacy shared
 * `https://www.getxervices.com/referral/:code`, the custom scheme
 * `xervices://referral/:code` (and its `-dev`/`-prev` build variants),
 * or a `?ref=` query param fallback.
 *
 * Deep links are untrusted input from any app on the device, so the result
 * is always validated against the referral code charset before being handed
 * back to a caller that will put it in a form field or an API call.
 */
export function parseReferralCode(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed;
  try {
    parsed = Linking.parse(url);
  } catch {
    return null;
  }

  const segments = (parsed.path ?? '').split('/').filter(Boolean);

  // xervices://referral/:code — the host segment carries "referral", the
  // code is the whole path.
  if (parsed.hostname?.toLowerCase() === 'referral' && segments.length >= 1) {
    const code = normalize(segments[0]);
    if (code) return code;
  }

  // https://.../pro/referral/:code or https://.../u/referral/:code
  if (
    segments.length >= 3 &&
    /^(pro|u)$/i.test(segments[0]) &&
    /^referral$/i.test(segments[1])
  ) {
    const code = normalize(segments[2]);
    if (code) return code;
  }

  // Legacy https://.../referral/:code
  if (segments.length >= 2 && /^referral$/i.test(segments[0])) {
    const code = normalize(segments[1]);
    if (code) return code;
  }

  const ref = parsed.queryParams?.ref;
  return normalize(Array.isArray(ref) ? ref[0] : ref);
}
