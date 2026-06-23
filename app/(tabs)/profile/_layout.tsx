import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="personal"
        options={{
          headerShown: false,
          title: 'Personal Details',
        }}
      />
      <Stack.Screen
        name="password"
        options={{
          headerShown: false,
          title: 'Password',
        }}
      />
      <Stack.Screen
        name="password-otp"
        options={{
          headerShown: false,
          title: 'Password',
        }}
      />
      <Stack.Screen
        name="new-password"
        options={{
          headerShown: false,
          title: 'Create new password',
        }}
      />
      <Stack.Screen
        name="disputes"
        options={{
          headerShown: false,
          title: 'Disputes',
        }}
      />
      <Stack.Screen
        name="dispute-detail"
        options={{
          headerShown: false,
          title: 'Disputes',
        }}
      />
      <Stack.Screen
        name="promo"
        options={{
          headerShown: false,
          title: 'Promotions & Rewards',
        }}
      />

      <Stack.Screen
        name="rate"
        options={{
          headerShown: false,
          title: 'Rate Xervices',
        }}
      />

      <Stack.Screen
        name="support"
        options={{
          headerShown: false,
          title: 'Support',
        }}
      />

      <Stack.Screen
        name="contact-support"
        options={{
          headerShown: false,
          title: 'Support',
        }}
      />

      <Stack.Screen
        name="mail-support"
        options={{
          headerShown: false,
          title: 'Support',
        }}
      />

      <Stack.Screen
        name="policies"
        options={{
          headerShown: false,
          title: 'Policies',
        }}
      />

      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
          title: 'Policies',
        }}
      />

      <Stack.Screen
        name="terms"
        options={{
          headerShown: false,
          title: 'Terms & conditions',
        }}
      />

      <Stack.Screen
        name="cancellation-policy"
        options={{
          headerShown: false,
          title: 'Cancellation policies',
        }}
      />

      <Stack.Screen
        name="about"
        options={{
          headerShown: false,
          title: 'About Xervices',
        }}
      />
    </Stack>
  );
}
