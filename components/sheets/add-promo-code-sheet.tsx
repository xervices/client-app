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
import { Input } from '../ui/input';

const formSchema = z.object({
  code: z.string().min(1, 'Promo Code is required.'),
});

export function AddPromoCodeSheet(props: SheetProps<'add-promo-code-sheet'>) {
  const form = useForm({
    defaultValues: {
      code: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      props.payload?.onAdd?.(value.code);
      SheetManager.hide('add-promo-code-sheet');
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
              SheetManager.hide('add-promo-code-sheet');
            }}
            className="absolute left-0 h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>
        </View>

        <form.Field name="code">
          {(field) => (
            <View className="flex gap-4">
              <Label nativeID="code">Add Promo Code</Label>
              <View>
                <Input
                  className="bg-white"
                  id="code"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Enter your promo code"
                  hasError={!field.state.meta.isValid}
                />

                {!field.state.meta.isValid ? <InputError errors={field.state.meta.errors} /> : null}
              </View>
            </View>
          )}
        </form.Field>

        <Button onPress={form.handleSubmit}>Continue</Button>
      </View>
    </ActionSheet>
  );
}
