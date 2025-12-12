import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { Text } from '@/components/ui/text';
import { Layout } from '@/components/layout';
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
import { SheetManager } from 'react-native-actions-sheet';

const formSchema = z
  .object({
    password: z.string().min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Screen() {
  const [checked, setChecked] = React.useState(false);

  function onCheckedChange(checked: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked(checked);
  }

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success('Password reset successful');
      SheetManager.show('success-sheet', {
        payload: {
          title: 'Password changed successfully',
          subtitle:
            'Your account is ready to use. You will be redirected to the home page shortly.',
          hideBackButton: true,
        },
      });
    },
  });

  return (
    <Layout>
      <View className="flex-1 gap-6">
        <View className="flex gap-2">
          <AuthHeader title="Create new password" />

          <Text className="text-center text-[#737381]">
            Please enter a password you can remember. Using special characters is advisable.
          </Text>
        </View>

        <View className="flex gap-4">
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

          <Button className="mt-6" onPress={form.handleSubmit}>
            Continue
          </Button>
        </View>
      </View>
    </Layout>
  );
}
