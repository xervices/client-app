import EnableLocationDialog from '@/components/enable-location-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, Search } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const data = [
  'Plumber',
  'Cleaner',
  'Cook',
  'Electrician',
  'Painter',
  'Ac Repair',
  'Packing and unpacking',
  'Handy Man',
  'Laundry Service',
  'Baker',
];

export default function Screen() {
  const { search } = useLocalSearchParams();
  const [searchValue, setSearchValue] = React.useState(typeof search === 'string' ? search : '');

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex flex-1 gap-4 bg-white">
        <Text className="text-center font-cabinet-bold text-xs text-[#B4B4BC]">Step 1 of 3</Text>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">Categories</Text>

          <Input
            placeholder="Book a service"
            className="rounded-full bg-white font-cabinet-bold"
            icon={<Search size={20} color="#B4B4BC" />}
            onChangeText={setSearchValue}
            value={searchValue}
          />
        </View>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#B4B4BC]">Popular Searches</Text>

          <View className="flex flex-row flex-wrap gap-2">
            {data.map((item) => (
              <Pressable
                key={item}
                onPress={() => setSearchValue(item)}
                className={`flex h-9 flex-row items-center gap-1 rounded-full border px-4 ${item === searchValue ? 'border-[#FFDCC1]' : 'border-[#E9E9EB]'} ${item === searchValue ? 'bg-[#FFF4EA]' : 'bg-transparent'}`}>
                <Text
                  className={`text-sm leading-none ${item === searchValue ? 'text-[#FE6A00]' : 'text-[#1B1B1E]'}`}>
                  {item}
                </Text>

                <ArrowUpRight size={14} color={item === searchValue ? '#FE6A00' : '#1B1B1E'} />
              </Pressable>
            ))}
          </View>
        </View>

        <Button onPress={() => router.navigate('/book/step-2')} className="mt-auto">
          Continue
        </Button>

        <EnableLocationDialog />
      </View>
    </ScrollView>
  );
}
