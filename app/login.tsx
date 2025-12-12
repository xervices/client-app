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
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

const formSchema = z.object({
  email: z.email().min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Screen() {
  const { login } = useAuthStore();

  const [checked, setChecked] = React.useState(false);

  function onCheckedChange(checked: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked(checked);
  }

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success('Login was successful');
      login();
    },
  });

  return (
    <Layout useBackground>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Login" />

          <Text className="text-center text-[#737381]">
            Enter your email and password to log in
          </Text>
        </View>

        <View className="flex gap-4">
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

          <Button onPress={form.handleSubmit}>Log In</Button>
        </View>

        <View className="flex w-full flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Checkbox
              aria-labelledby="remember-me-checkbox"
              id="remember-me-checkbox"
              checked={checked}
              onCheckedChange={onCheckedChange}
            />
            <Label
              nativeID="remember-me-checkbox"
              htmlFor="remember-me-checkbox"
              className="text-sm"
              onPress={Platform.select({
                native: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setChecked((prev) => !prev);
                },
              })}>
              Remember me
            </Label>
          </View>

          <Pressable onPress={() => router.navigate('/forgot-password')}>
            <Text className="font-cabinet-medium text-sm text-primary">Forgot Password ?</Text>
          </Pressable>
        </View>

        <View className="flex w-full flex-row items-center justify-between gap-4">
          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />

          <Text className="text-sm text-[#B4B4BC]">Or</Text>

          <View className="h-0.5 flex-1 bg-[#FFDCC1]" />
        </View>

        <Button className="border-[#B4B4BC] bg-[#F4F4F5]">
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
    </Layout>
  );
}
