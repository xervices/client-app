import Constants from 'expo-constants';
import { type PropsWithChildren } from 'react';
import PostHog, { PostHogProvider } from 'posthog-react-native';

const posthogConfig = Constants.expoConfig?.extra?.posthog as
  { projectToken?: string; host?: string } | undefined;

const projectToken = posthogConfig?.projectToken;
const host = posthogConfig?.host;
const isPostHogConfigured = Boolean(projectToken && host);

if (!isPostHogConfigured && __DEV__) {
  const missingVariable = projectToken ? 'EXPO_PUBLIC_POSTHOG_HOST' : 'EXPO_PUBLIC_POSTHOG_KEY';
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
  );
}

export const posthog = isPostHogConfigured
  ? new PostHog(projectToken!, {
      host: host!,
      captureAppLifecycleEvents: true,
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
        },
      },
      enableSessionReplay: true,
      logs: {
        serviceName: 'xervices-mobile',
        environment: __DEV__ ? 'development' : 'production',
        serviceVersion: Constants.expoConfig?.version,
      },
    })
  : undefined;

export function PostHogRootProvider({ children }: PropsWithChildren) {
  if (!posthog) {
    return children;
  }

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
      }}>
      {children}
    </PostHogProvider>
  );
}
