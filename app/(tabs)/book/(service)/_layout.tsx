import { Stack, usePathname } from 'expo-router';
import { Layout } from '@/components/layout';
import { View } from 'react-native';
import { AuthHeader } from '@/components/auth-header';

export default function BookServiceLayout() {
  const pathname = usePathname();

  const currentStep =
    pathname === '/book'
      ? 1
      : pathname === '/book/step-2'
        ? 2
        : pathname === '/book/step-3'
          ? 3
          : 0;

  return (
    <Layout
      useBackground
      scrollable={false}
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Book a service" showBackButton={currentStep > 1} />

          <View className="mt-2 flex flex-row gap-2">
            <View className={`h-2 flex-1 rounded-full bg-[#FE6A00]`} />
            <View
              className={`h-2 flex-1 rounded-full ${currentStep > 1 ? 'bg-[#FE6A00]' : 'bg-[#E9E9EB]'}`}
            />
            <View
              className={`h-2 flex-1 rounded-full ${currentStep === 3 ? 'bg-[#FE6A00]' : 'bg-[#E9E9EB]'}`}
            />
          </View>
        </View>
      }>
      <Stack screenOptions={{ headerShown: false }} />
    </Layout>
  );
}
