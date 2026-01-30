import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="notification"
        options={{
          headerShown: false,
          title: 'Notification',
        }}
      />
      <Stack.Screen
        name="services"
        options={{
          headerShown: false,
          title: 'Services',
        }}
      />
      <Stack.Screen
        name="searching"
        options={{
          headerShown: false,
          title: 'Searching',
        }}
      />
      <Stack.Screen
        name="pro"
        options={{
          headerShown: false,
          title: 'Pro',
        }}
      />
      <Stack.Screen
        name="offer"
        options={{
          headerShown: false,
          title: 'Offer',
        }}
      />
      <Stack.Screen
        name="no-result"
        options={{
          headerShown: false,
          title: 'No Result',
        }}
      />
      <Stack.Screen
        name="confirm"
        options={{
          headerShown: false,
          title: 'Confirm',
        }}
      />
    </Stack>
  );
}
