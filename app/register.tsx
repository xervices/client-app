import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
import { Icon } from '@/components/ui/icon';
import { router } from 'expo-router';
import { AuthHeader } from '@/components/auth-header';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputError } from '@/components/ui/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Image } from 'expo-image';

const formSchema = z
  .object({
    fullname: z.string().min(1, 'Fullname is required.'),
    phone: z.string().min(1, 'Phone number is required.'),
    email: z.email('Invalid email address').min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Screen() {
  const { login } = useAuthStore();

  const [checked, setChecked] = React.useState(false);

  function onCheckedChange(checked: boolean) {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked(checked);
  }

  const form = useForm({
    defaultValues: {
      fullname: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      router.navigate({
        pathname: '/verify-email',
        params: {
          email: value.email,
        },
      });
    },
  });

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Get Started now" />

          <Text className="text-center text-[#737381]">
            Join thousands of satisfied customers using trusted pros.
          </Text>
        </View>

        <View className="flex gap-4">
          <form.Field name="fullname">
            {(field) => (
              <View>
                <Label nativeID="fullname">Full name</Label>
                <Input
                  id="fullname"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your name"
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <View>
                <Label nativeID="email">Email</Label>
                <Input
                  id="email"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your email"
                  hasError={!field.state.meta.isValid}
                  keyboardType="email-address"
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <View>
                <Label nativeID="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your phone number"
                  hasError={!field.state.meta.isValid}
                  keyboardType="phone-pad"
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <View>
                <Label nativeID="password">Password</Label>
                <Input
                  id="password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your password"
                  secureTextEntry
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <View>
                <Label nativeID="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Confirm your password"
                  secureTextEntry
                  hasError={!field.state.meta.isValid}
                />
                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            )}
          </form.Field>

          <Button onPress={form.handleSubmit}>Get Started</Button>
        </View>

        <View className="flex flex-row items-center justify-between gap-4">
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
          <Text className="text-[#737381]">Already have an account?</Text>

          <Pressable onPress={() => router.navigate('/login')}>
            <Text className="text-primary">Log in</Text>
          </Pressable>
        </View>

        <View className="flex flex-row items-center justify-center gap-1.5">
          <Text className="text-center text-[#737381]">
            <Pressable>
              <Text className="mx-1 leading-normal text-[#737381]">
                By creating an account, you agree to our
              </Text>
            </Pressable>

            <Pressable>
              <Text className="leading-normal text-primary">Terms of Service</Text>
            </Pressable>
            <Pressable>
              <Text className="mx-1 leading-normal text-[#737381]">and</Text>
            </Pressable>
            <Pressable>
              <Text className="leading-normal text-primary">Privacy Policy</Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </Layout>
  );
}
