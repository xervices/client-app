import { View, Pressable } from 'react-native';
import { Input } from '../ui/input';
import { Search, X } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { useState } from 'react';
import { router } from 'expo-router';

export function SearchInput() {
  const [showBanner, setShowBanner] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleOnSearch = () => {
    console.log('You searched for: ', searchValue);
    setShowBanner(false);
    router.navigate({
      pathname: '/book',
      params: {
        search: searchValue,
      },
    });
  };

  return (
    <View className="relative px-6">
      <Input
        placeholder="Book a service"
        className="rounded-full bg-white"
        icon={<Search size={20} color="#B4B4BC" />}
        onFocus={() => {
          setShowBanner(true);
        }}
        onChangeText={setSearchValue}
      />

      {showBanner && (
        <View
          className="absolute left-6 right-6 top-[70px] z-10 flex w-full gap-2 rounded-[8px] bg-white p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
          {/* Custom Triangle Pointer */}
          <View
            style={{
              position: 'absolute',
              top: -8,
              left: 24,
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderBottomWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#FFFFFF',
            }}
          />

          <View className="flex flex-row justify-between gap-1">
            <Text className="font-cabinet-bold text-[#1B1B1E]">
              We'll match you with a professional.
            </Text>
            <Pressable
              onPress={() => setShowBanner(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4EA]">
              <X color={'#1B1B1E'} size={16} />
            </Pressable>
          </View>
          <Text className="text-sm text-[#737381]">
            We're here to help you get the chore off your list—affordably and stress-free.
          </Text>
          <Button onPress={handleOnSearch}>Book a service</Button>
        </View>
      )}
    </View>
  );
}
