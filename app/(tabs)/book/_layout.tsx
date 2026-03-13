import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="(service)"
        options={{
          headerShown: false,
          title: 'Book a Service',
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
        name="no-result"
        options={{
          headerShown: false,
          title: 'No Result',
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
        name="pro"
        options={{
          headerShown: false,
          title: 'Pro',
        }}
      />
      <Stack.Screen
        name="confirm"
        options={{
          headerShown: false,
          title: 'Confirm Booking',
        }}
      />
      <Stack.Screen
        name="cancellation-policy"
        options={{
          headerShown: false,
          title: 'Confirm Booking',
        }}
      />
    </Stack>
  );
}
