import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

import { api } from '@/api';
import {
  getStableDeviceId,
  hasTrackedInstall,
  markInstallTracked,
} from '@/lib/app-install';

export function useTrackAppInstall() {
  const { mutateAsync } = useMutation(api.appInstall());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (await hasTrackedInstall()) return;
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

      const deviceId = await getStableDeviceId();
      if (cancelled) return;

      try {
        await mutateAsync({
          deviceId,
          platform: Platform.OS,
          appVersion: Application.nativeApplicationVersion ?? undefined,
        });
        await markInstallTracked();
      } catch {
        // Retry on next launch.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mutateAsync]);
}
