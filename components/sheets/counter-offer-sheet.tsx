import { Platform, Pressable, TextInput, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Text } from '../ui/text';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatCurrency } from '@/lib/utils';

export function CounterOfferSheet(props: SheetProps<'counter-offer-sheet'>) {
  const initialAmount = props.payload?.amount ?? 0;

  const [amount, setAmount] = useState(initialAmount);
  const [displayValue, setDisplayValue] = useState(String(initialAmount));
  const [minAmount] = useState(initialAmount ? initialAmount - 0.2 * initialAmount : 1000);

  const isPressingButton = useRef(false);

  const round2dp = (n: number) => Math.round(n * 100) / 100;

  // Pure read: parses displayValue into a valid, clamped number without
  // touching any state. Safe to call from button handlers.
  const getCommittedValue = (): number => {
    const raw = displayValue.replace(/\.$/, '');
    const parsed = parseFloat(raw);
    if (!raw || isNaN(parsed) || parsed <= 0) return amount;
    return round2dp(Math.max(parsed, minAmount));
  };

  // Write: used on blur to snap display to a clean committed value.
  const commitDisplay = () => {
    const raw = displayValue.replace(/\.$/, '');
    const parsed = parseFloat(raw);
    const isInvalid = !raw || isNaN(parsed) || parsed <= 0;
    const value = isInvalid ? amount : round2dp(Math.max(parsed, minAmount));
    setAmount(value);
    setDisplayValue(String(value));
  };

  const handleDecrement = () => {
    const base = getCommittedValue();
    if (base > minAmount) {
      const next = round2dp(Math.max(base - 100, minAmount));
      setAmount(next);
      setDisplayValue(String(next));
    }
  };

  const handleIncrement = () => {
    const base = getCommittedValue();
    const next = round2dp(base + 100);
    setAmount(next);
    setDisplayValue(String(next));
  };

  const handleBlur = () => {
    if (isPressingButton.current) return;
    commitDisplay();
  };

  const handleConfirm = () => {
    props.payload?.onConfirm?.(getCommittedValue());
    SheetManager.hide('counter-offer-sheet');
  };

  const isAtMin = Number(displayValue) <= minAmount;

  return (
    <ActionSheet
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      containerStyle={{ backgroundColor: '#FFFFFF' }}
      indicatorStyle={{ width: 38, height: 6, backgroundColor: '#FFF4EA' }}>
      <View className="flex gap-4 p-6 pt-0">
        <View className="relative flex w-full flex-row items-center gap-4">
          <Pressable
            onPress={() => SheetManager.hide('counter-offer-sheet')}
            className="h-8 w-8 justify-center">
            <ArrowLeft size={24} color={'#B4B4BC'} />
          </Pressable>

          <Text className="font-cabinet-bold text-[18px] text-[#737381]">
            {props.payload?.type === 'counter' ? 'Counteroffer' : 'Offer'} to{' '}
            {props.payload?.name || ''}
          </Text>
        </View>

        <View className="flex w-1/2 flex-row items-center gap-2">
          <Avatar alt="User's Avatar" className="h-10 w-10">
            <AvatarImage source={{ uri: props.payload?.profileImage }} />
            <AvatarFallback className="bg-primary">
              <Text className="font-cabinet-bold text-xs uppercase leading-none">
                {props.payload?.name?.substring(0, 2)}
              </Text>
            </AvatarFallback>
          </Avatar>

          <View>
            <Text className="font-cabinet-bold text-[18px] leading-none text-[#1B1B1E]">
              {props.payload?.name}
            </Text>

            {props.payload?.counterAmount && (
              <Text className="text-[#B4B4BC]">
                {props.payload?.name} offer:{' '}
                <Text className="text-[#FE6A00]">
                  {formatCurrency(props.payload.counterAmount)}
                </Text>
              </Text>
            )}
          </View>
        </View>

        <View className="flex gap-4">
          <Text className="text-sm leading-none text-[#737381]">
            {props.payload?.type === 'counter' ? 'Your Counteroffer' : 'Your Offer'}
          </Text>

          {isAtMin ? (
            <Text className="text-center text-sm leading-none text-[#FFAC70]">Can't go lower</Text>
          ) : null}

          <View className="flex flex-row items-center justify-center gap-4">
            <Pressable
              onPressIn={() => {
                isPressingButton.current = true;
              }}
              onPressOut={() => {
                isPressingButton.current = false;
              }}
              onPress={handleDecrement}
              className="flex h-8 w-12 items-center justify-center rounded-l-full bg-[#F4F4F5]">
              <Minus color={'#FF8733'} size={24} />
            </Pressable>

            <View className="flex flex-row items-center">
              <Text className="font-cabinet-bold leading-none text-[#1B1B1E]">₦</Text>
              <TextInput
                style={{
                  ...Platform.select({
                    ios: {
                      paddingTop: 0,
                      paddingBottom: 0,
                      lineHeight: undefined,
                    },
                    android: { textAlignVertical: 'center' },
                  }),
                }}
                value={displayValue}
                onChangeText={(text) => {
                  const cleaned = text
                    .replace(/[^0-9.]/g, '') // strip non-numeric, non-dot
                    .replace(/(\..*)\./g, '$1') // remove any extra dots
                    .replace(/(\.\d{2})\d+/g, '$1'); // cap at 2 decimal places
                  setDisplayValue(cleaned);
                }}
                onBlur={handleBlur}
                keyboardType="decimal-pad"
                className="font-cabinet-bold text-base leading-none text-[#1B1B1E]"
              />
            </View>

            <Pressable
              onPressIn={() => {
                isPressingButton.current = true;
              }}
              onPressOut={() => {
                isPressingButton.current = false;
              }}
              onPress={handleIncrement}
              className="flex h-8 w-12 items-center justify-center rounded-r-full bg-[#F4F4F5]">
              <Plus color={'#FF8733'} size={24} />
            </Pressable>
          </View>
        </View>

        <Button onPress={handleConfirm}>
          {props.payload?.type === 'counter' ? 'Send Counteroffer' : 'Send Offer'}
        </Button>
      </View>
    </ActionSheet>
  );
}
