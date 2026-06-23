import { Text } from '@/components/ui/text';
import { NotificationSocketProvider } from '@/providers/notification-socket-provider';
import { OffersProvider } from '@/providers/offers-context';
import { useAuthStore } from '@/store/auth-store';
import { CommonActions } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Key, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tabs whose nested stack should be reset to a known root route whenever
// the tab loses focus. Maps tab route name → desired root screen name.
const RESET_ON_BLUR_TABS: Record<string, string> = {
  book: '(service)',
};

export default function TabsLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <NotificationSocketProvider>
      <OffersProvider autoConnect={isLoggedIn}>
        <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <MyTabBar {...props} />}>
          <Tabs.Screen
            name="(home)"
            options={{
              title: 'Home',
            }}
          />
          <Tabs.Screen
            name="jobs"
            options={{
              title: 'My Jobs',
            }}
          />
          <Tabs.Screen
            name="book"
            options={{
              title: 'Book a service',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
            }}
          />
        </Tabs>
      </OffersProvider>
    </NotificationSocketProvider>
  );
}

type MyTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

function MyTabBar({ state, descriptors, navigation }: MyTabBarProps) {
  const insets = useSafeAreaInsets();

  // Force-reset specific tabs to a known root route whenever the focused tab
  // changes away from them. This handles both tab-bar presses and programmatic
  // cross-tab navigation (e.g. router.replace to a route in a different tab).
  // We reset to a named root rather than popping, because the leaving tab's
  // nested stack may not contain the desired root (e.g. when navigation into
  // the screen used router.replace, which clears the underlying stack).
  const prevIndexRef = useRef(state.index);
  useEffect(() => {
    const prev = prevIndexRef.current;
    if (prev !== state.index) {
      const leavingRoute = state.routes[prev];
      const desiredRoot = leavingRoute && RESET_ON_BLUR_TABS[leavingRoute.name];
      const innerState = leavingRoute?.state;
      const alreadyAtRoot =
        innerState &&
        innerState.index === 0 &&
        innerState.routes[0]?.name === desiredRoot;

      if (desiredRoot && innerState && !alreadyAtRoot) {
        navigation.dispatch({
          ...CommonActions.reset({
            index: 0,
            routes: [{ name: desiredRoot }],
          }),
          target: innerState.key,
        });
      }
      prevIndexRef.current = state.index;
    }
  }, [state.index, state.routes, navigation]);

  const TAB_ICONS: Record<string, { icon: any; active: any }> = {
    '(home)': {
      icon: require('@/assets/icons/home.svg'),
      active: require('@/assets/icons/home-active.svg'),
    },
    jobs: {
      icon: require('@/assets/icons/jobs.svg'),
      active: require('@/assets/icons/jobs-active.svg'),
    },
    book: {
      icon: require('@/assets/icons/book.svg'),
      active: require('@/assets/icons/book-active.svg'),
    },
    profile: {
      icon: require('@/assets/icons/profile.svg'),
      active: require('@/assets/icons/profile-active.svg'),
    },
  };

  return (
    <View style={{ paddingBottom: insets.bottom }} className="bg-white">
      <View className="flex h-20 w-full flex-row items-center justify-center gap-[8%] bg-white">
        {state.routes.map(
          (route: { key: string | number; name: any }, index: Key | null | undefined) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                className="flex items-center gap-[6px]">
                <Image
                  source={isFocused ? TAB_ICONS[route?.name].active : TAB_ICONS[route?.name].icon}
                  style={{
                    width: 24,
                    height: 24,
                  }}
                  contentFit="contain"
                />

                <Text
                  className={`font-cabinet-bold text-[14px] ${
                    isFocused ? 'text-secondary' : 'text-[#737381]'
                  }`}>
                  {label}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>
    </View>
  );
}
