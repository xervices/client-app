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

export function CancelServiceSheet(props: SheetProps<'cancel-service-sheet'>) {
  const form = useForm({
    defaultValues: {
      reason: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      props?.payload?.onConfirm?.(value.reason);
      SheetManager?.hide('cancel-service-sheet');
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
      <View className="flex gap-6 p-6 pt-0">
        <View className="relative flex w-full flex-row items-center justify-center">
          <Pressable
            onPress={() => {
              SheetManager.hide('cancel-service-sheet');
            }}
            className="absolute left-0 h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>

          <Text className="text-center font-cabinet-bold text-[#1B1B1E]">
            Cancel Service Request
          </Text>
        </View>

        <form.Field name="reason">
          {(field) => (
            <View className="flex gap-4">
              <Label nativeID="reason">Can you tell us why you want to cancel this request?</Label>
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
          Cancel Request
        </Button>
      </View>
    </ActionSheet>
  );
}
