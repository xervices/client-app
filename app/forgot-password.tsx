import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import * as z from 'zod';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner-native';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';

const formSchema = z.object({
  email: z.string().min(1, 'Email/Phone number is required.'),
});

export default function Screen() {
  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success('OTP sent successfully');
      router.navigate({
        pathname: '/forgot-password-otp',
        params: {
          email: value.email,
        },
      });
    },
  });

  return (
    <Layout horizontalPadding={false} useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2 px-6">
          <AuthHeader title="Forgot password" />

          <Text className="text-center text-[#737381]">
            Enter your email or Phone number to reset password
          </Text>
        </View>

        <View className="flex aspect-[375/232] w-full flex-col items-center justify-center gap-6">
          <Image
            source={require('@/assets/images/forgot-password-bg.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />

          <View className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#FFF4EA]/50">
            <Image
              source={require('@/assets/images/logo.svg')}
              style={{ width: 112, height: 80 }}
              contentFit="contain"
            />
          </View>
        </View>

        <View className="flex gap-6 px-6">
          <View className="flex gap-8">
            <form.Field name="email">
              {(field) => (
                <View>
                  <Label nativeID="email">Email or phone number</Label>
                  <Input
                    id="email"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    placeholder="alexbaker@gmail.com or +23480123456789"
                    hasError={!field.state.meta.isValid}
                    keyboardType="email-address"
                  />
                  {!field.state.meta.isValid ? (
                    <InputError errors={field.state.meta.errors} />
                  ) : null}
                </View>
              )}
            </form.Field>

            <Button onPress={form.handleSubmit}>Send code</Button>
          </View>

          <View className="flex w-full flex-row items-center justify-between gap-4">
            <View className="h-0.5 flex-1 bg-[#FFDCC1]" />

            <Text className="text-sm text-[#B4B4BC]">Or</Text>

            <View className="h-0.5 flex-1 bg-[#FFDCC1]" />
          </View>

          <Button className="border-[#B4B4BC] bg-background">
            <Image
              source={require('@/assets/icons/google.svg')}
              style={{ width: 18, height: 18 }}
              contentFit="contain"
            />

            <Text className="font-cabinet-extrabold text-[#737381]">Continue with Google</Text>
          </Button>

          <View className="flex flex-row items-center justify-center gap-1.5">
            <Text className="text-[#737381]">Don’t have an account?</Text>

            <Pressable onPress={() => router.navigate('/register')}>
              <Text className="text-primary">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Layout>
  );
}
