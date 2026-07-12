import '@/global.css';

import * as ExpoSplashScreen from 'expo-splash-screen';

import { useAuthStore } from '@/store/auth-store';
import { PortalHost } from '@rn-primitives/portal';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SheetProvider } from 'react-native-actions-sheet';
import { Sheets } from '@/components/sheets';
import { View } from 'react-native';
import { LocationProvider } from 'solomo';
import { QueryProvider, queryClient } from '@/providers/query-provider';
import { NotificationProvider } from '@/providers/notification-provider';
import { useEffect, useRef, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SplashScreen } from '@/components/splash-screen';
import { useTrackAppInstall } from '@/hooks/use-track-app-install';
import { useReferralDeepLink } from '@/hooks/use-referral-deep-link';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { isLoggedIn, isGuest, hasCompletedOnboarding } = useAuthStore();
  const consumePendingRedirect = useAuthStore((s) => s.consumePendingRedirect);
  const wasLoggedIn = useRef(isLoggedIn);

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // The custom <SplashScreen /> is already painted on this first frame,
    // so hide the native splash immediately to reveal it.
    ExpoSplashScreen.hideAsync();
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!wasLoggedIn.current && isLoggedIn) {
      queryClient.invalidateQueries();

      const dest = consumePendingRedirect();
      if (dest) {
        // Defer one tick so the protected stack mounts before navigating
        setTimeout(() => router.replace(dest as any), 0);
      }
    }
    wasLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, consumePendingRedirect]);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: '254247444720-svvp7snle85nn3giielj7r9cmftm1ofv.apps.googleusercontent.com',
      webClientId: '254247444720-3g5icekin9d9ls4hg0faag1mgsarb3u6.apps.googleusercontent.com',
    });
  }, []);

  return (
    // <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
    <GestureHandlerRootView>
      <QueryProvider>
        <LocationProvider>
          <KeyboardProvider>
            <View className="flex-1 bg-white">
              <NotificationProvider>
                <SheetProvider>
                  <AppInstallTracker />
                  <ReferralDeepLinkHandler />
                  <Sheets />
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                  <Stack>
                    <Stack.Protected guard={isLoggedIn || isGuest}>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack.Protected>

                    <Stack.Protected guard={isLoggedIn}>
                      <Stack.Screen name="chat" options={{ headerShown: false }} />
                      <Stack.Screen name="ongoing" options={{ headerShown: false }} />
                      <Stack.Screen name="photo-preview" options={{ headerShown: false }} />
                      <Stack.Screen name="rate" options={{ headerShown: false }} />
                      <Stack.Screen name="dispute" options={{ headerShown: false }} />
                    </Stack.Protected>

                    

                    <Stack.Protected guard={!isLoggedIn && hasCompletedOnboarding}>
                      <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="verify-email" options={{ headerShown: false }} />
                      <Stack.Screen name="verify-device" options={{ headerShown: false }} />
                      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                      <Stack.Screen name="forgot-password-otp" options={{ headerShown: false }} />
                      <Stack.Screen name="new-password" options={{ headerShown: false }} />
                      <Stack.Screen name="terms" options={{ headerShown: false }} />
                      <Stack.Screen name="privacy" options={{ headerShown: false }} />
                    </Stack.Protected>

                    <Stack.Protected guard={!hasCompletedOnboarding}>
                      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                    </Stack.Protected>

                    {/* `register` sits outside the onboarding guard so a referral deep link
                        can land a brand-new user straight on it. Reaching the screen marks
                        them onboarded — see the effect in `register.tsx`. */}
                    <Stack.Protected guard={!isLoggedIn}>
                      <Stack.Screen name="register" options={{ headerShown: false }} />
                    </Stack.Protected>
                  </Stack>
                  <Toaster
                    theme="light"
                    richColors
                    visibleToasts={3}
                    styles={{
                      title: {
                        fontFamily: 'CabinetGrotesk-Bold',
                      },
                    }}
                  />
                  <PortalHost />
                  {showSplash && (
                    <View className="absolute inset-0 z-50">
                      <SplashScreen />
                    </View>
                  )}
                </SheetProvider>
              </NotificationProvider>
            </View>
          </KeyboardProvider>
        </LocationProvider>
      </QueryProvider>
    </GestureHandlerRootView>
    // </ThemeProvider>
  );
}

function AppInstallTracker() {
  useTrackAppInstall();
  return null;
}

function ReferralDeepLinkHandler() {
  useReferralDeepLink();
  return null;
}
