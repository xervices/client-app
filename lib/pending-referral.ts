import Storage from 'expo-sqlite/kv-store';

const CODE_KEY = 'pending_referral_code';
const STORED_AT_KEY = 'pending_referral_stored_at';

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function setPendingReferral(code: string): Promise<void> {
  await Storage.setItem(CODE_KEY, code);
  await Storage.setItem(STORED_AT_KEY, Date.now().toString());
}

// Readable at boot without waiting on zustand-persist rehydration, so it
// can't race the auth guard the way `useAuthStore` does.
export async function getPendingReferral(): Promise<string | null> {
  const [code, storedAt] = await Promise.all([
    Storage.getItem(CODE_KEY),
    Storage.getItem(STORED_AT_KEY),
  ]);

  if (!code) return null;

  if (storedAt && Date.now() - Number(storedAt) > TTL_MS) {
    await clearPendingReferral();
    return null;
  }

  return code;
}

export async function clearPendingReferral(): Promise<void> {
  await Storage.removeItem(CODE_KEY);
  await Storage.removeItem(STORED_AT_KEY);
}
