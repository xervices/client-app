import Storage from 'expo-sqlite/kv-store';
import * as Crypto from 'expo-crypto';
import { getDeviceInfo } from '@/lib/utils';

const DEVICE_ID_KEY = 'install_device_id';
const TRACKED_KEY = 'install_tracked_at';

// Once written, DEVICE_ID_KEY is read-only — nothing else should overwrite it.
export async function getStableDeviceId(): Promise<string> {
  const existing = await Storage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const { deviceId } = await getDeviceInfo();
  const id = deviceId ?? Crypto.randomUUID();
  await Storage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export async function hasTrackedInstall(): Promise<boolean> {
  return (await Storage.getItem(TRACKED_KEY)) !== null;
}

export async function markInstallTracked(): Promise<void> {
  await Storage.setItem(TRACKED_KEY, new Date().toISOString());
}
