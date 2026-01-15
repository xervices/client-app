import { api } from '@/api';
import EnableLocationDialog from '@/components/enable-location-dialog';
import { SearchInput } from '@/components/home/search-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useServiceStore } from '@/store/service-store';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, Search } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function Screen() {
  const { search, id }: { search: string; id: string } = useLocalSearchParams();

  const { data } = useQuery(api.getAllCategories());

  const { setStep1 } = useServiceStore();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex flex-1 gap-4 bg-white">
        <Text className="text-center font-cabinet-bold text-xs text-[#B4B4BC]">Step 1 of 3</Text>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">Categories</Text>

          <SearchInput defaultCategoryId={id} />

          {/* <Input
            placeholder="Book a service"
            className="rounded-full bg-white font-cabinet-bold"
            icon={<Search size={20} color="#B4B4BC" />}
            // onChangeText={setSearchValue}
            value={search}
            editable={false}
          /> */}
        </View>

        {data && (
          <View className="flex gap-2">
            <Text className="font-cabinet-bold leading-none text-[#B4B4BC]">Popular Searches</Text>

            <View className="flex flex-row flex-wrap gap-2">
              {data?.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    router.setParams({
                      search: item.name,
                      id: item.id,
                    });
                  }}
                  className={`flex h-9 flex-row items-center gap-1 rounded-full border px-4 ${item.id === id ? 'border-[#FFDCC1]' : 'border-[#E9E9EB]'} ${item.id === id ? 'bg-[#FFF4EA]' : 'bg-transparent'}`}>
                  <Text
                    className={`text-sm leading-none ${item.id === id ? 'text-[#FE6A00]' : 'text-[#1B1B1E]'}`}>
                    {item.name}
                  </Text>

                  <ArrowUpRight size={14} color={item.id === id ? '#FE6A00' : '#1B1B1E'} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Button
          onPress={() => {
            setStep1({ categoryId: id });

            router.navigate({
              pathname: '/book/step-2',
              params: {
                categoryId: id,
              },
            });
          }}
          className="mt-auto"
          disabled={!id}>
          Continue
        </Button>

        <EnableLocationDialog />
      </View>
    </ScrollView>
  );
}
