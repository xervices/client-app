import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Jobs',
        }}
      />

      <Stack.Screen
        name="completed"
        options={{
          headerShown: false,
          title: 'Completed Jobs',
        }}
      />

      <Stack.Screen
        name="ongoing"
        options={{
          headerShown: false,
          title: 'Ongoing Job',
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="photo-preview"
        options={{
          headerShown: false,
          title: 'Photo Preview',
        }}
      />

      <Stack.Screen
        name="rate"
        options={{
          headerShown: false,
          title: 'Rate',
        }}
      />

      <Stack.Screen
        name="dispute"
        options={{
          headerShown: false,
          title: 'Dispute',
        }}
      />
    </Stack>
  );
}
