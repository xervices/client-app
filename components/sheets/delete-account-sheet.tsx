import { Pressable, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { ArrowLeft } from 'lucide-react-native';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { InputError } from '../ui/input-error';
import { Button } from '../ui/button';

const formSchema = z.object({
  reason: z.string().min(1, 'Reason is required.'),
});

export function DeleteAccountSheet() {
  const form = useForm({
    defaultValues: {
      reason: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      let deleteSheet = await SheetManager.hide('delete-account-sheet');

      if (deleteSheet)
        return await SheetManager.show('success-sheet', {
          payload: {
            subtitle:
              'Your card has been deleted successfully. You will be redirected to the login page shortly',
            title: 'Account deleted successfully',
            useCheckImage: true,
          },
        });
    },
  });

  return (
    <ActionSheet
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      containerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      indicatorStyle={{
        width: 38,
        height: 6,
        backgroundColor: '#FFF4EA',
      }}>
      <View className="flex gap-6 p-6">
        <View className="relative flex w-full flex-row items-center justify-center">
          <Pressable
            onPress={() => {
              SheetManager.hide('delete-account-sheet');
            }}
            className="absolute left-0 h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>

          <Text className="text-center font-cabinet-bold text-[#1B1B1E]">Delete Account</Text>
        </View>

        <form.Field name="reason">
          {(field) => (
            <View className="flex gap-4">
              <Label nativeID="reason">
                We are sad to see you go. Can you tell us why you want to delete your account?
              </Label>
              <View>
                <Textarea
                  className="bg-white"
                  id="message"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your message"
                  hasError={!field.state.meta.isValid}
                />

                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            </View>
          )}
        </form.Field>

        <Button onPress={form.handleSubmit} variant={'destructive'}>
          Delete my account
        </Button>
      </View>
    </ActionSheet>
  );
}
