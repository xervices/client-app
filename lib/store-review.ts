import * as StoreReview from 'expo-store-review';
import Storage from 'expo-sqlite/kv-store';

const LAST_PROMPTED_KEY = 'store_review_last_prompted_at';
const THROTTLE_DAYS = 90;

export async function maybeRequestStoreReview(): Promise<void> {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    const hasAction = await StoreReview.hasAction();
    if (!hasAction) return;

    const lastPromptedRaw = await Storage.getItem(LAST_PROMPTED_KEY);
    if (lastPromptedRaw) {
      const lastPromptedMs = new Date(lastPromptedRaw).getTime();
      const ageDays = (Date.now() - lastPromptedMs) / (1000 * 60 * 60 * 24);
      if (ageDays < THROTTLE_DAYS) return;
    }

    await StoreReview.requestReview();
    await Storage.setItem(LAST_PROMPTED_KEY, new Date().toISOString());
  } catch {
    // Never surface review-prompt errors to the user.
  }
}
