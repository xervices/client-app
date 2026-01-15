import { Pressable, View } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ArrowUpRight, BadgeCheck, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function ActiveJobs() {
  const { data } = useQuery(api.getUserServiceRequests());

  const inCompleteSearch = data?.filter((i) => i.status === 'open');
  const activeJobs = data?.filter((i) => i.status === 'accepted');
  const negotiatingJobs = data?.filter((i) => i.status === 'in_negotiation');

  return (
    <View className="flex gap-2 px-6">
      <Text className="font-cabinet-medium text-xs uppercase">Active Jobs</Text>

      {/* Incomplete search */}
      {inCompleteSearch &&
        inCompleteSearch?.length > 0 &&
        inCompleteSearch?.map((search) => (
          <View
            key={search.id}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            className="flex gap-4 rounded-[8px] bg-white p-4">
            <View className="flex flex-row items-center justify-between">
              <Text className="flex-1 font-cabinet-bold text-primary">Incomplete search</Text>

              <Pressable className="flex h-4 w-4 items-center justify-center">
                <X size={14} color={'#737381'} />
              </Pressable>
            </View>

            <Text className="text-sm text-[#737381]">
              Your previous search for {search.category.name} was not complete. Click "continue
              search" to continue your search.
            </Text>

            <View className="flex flex-row items-center justify-end">
              <Pressable
                onPress={() => {
                  router.navigate({
                    pathname: '/book/searching',
                    params: {
                      id: search.id,
                    },
                  });
                }}
                className="flex flex-row items-center gap-1">
                <Text className="font-cabinet-bold text-sm text-primary">Continue search</Text>

                <ArrowUpRight size={14} color={'#FE6A00'} />
              </Pressable>
            </View>
          </View>
        ))}

      {activeJobs && activeJobs?.length > 0 ? (
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          className="flex gap-4 rounded-[8px] bg-white p-4">
          <View className="flex flex-row items-center justify-between">
            <Text className="flex-1 font-cabinet-bold text-[#1B1B1E]">Plumber</Text>

            <View className="flex h-[26px] items-center justify-center rounded-full bg-[#FFF4EA] px-3">
              <Text className="text-sm text-primary">In Progress</Text>
            </View>
          </View>

          <Text className="text-sm text-[#737381]">
            Leaky kitchen faucet needs immediate repair. Water dripping constantly.
          </Text>

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-1">
              <Avatar alt="User's Avatar" className="h-6 w-6">
                <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                <AvatarFallback className="bg-primary">
                  <Text className="font-cabinet-bold leading-none">ZN</Text>
                </AvatarFallback>
              </Avatar>

              <View className="flex flex-row items-center">
                <Text className="font-cabinet-bold text-sm text-[#737381]">Sarah Rodri</Text>

                <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
              </View>
            </View>

            <Pressable className="flex flex-row items-center gap-1">
              <Text className="font-cabinet-bold text-sm text-primary">Track activities</Text>

              <ArrowUpRight size={14} color={'#FE6A00'} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex w-full items-center justify-center gap-5 rounded-[8px] border border-[#D4D4D8] p-4">
          <Text className="text-sm text-[#B4B4BC]">No active job</Text>

          <Button onPress={() => router.navigate('/book')} className="w-full">
            Book a service
          </Button>
        </View>
      )}

      {negotiatingJobs && negotiatingJobs?.length > 0 && (
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          className="flex gap-4 rounded-[8px] bg-white p-4">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm text-[#737381]">8 artisans sent offers</Text>
          </View>

          <View className="flex flex-row items-center justify-between">
            <View className="flex-row">
              <Avatar
                alt="@mrzachnugent"
                className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                <AvatarFallback>
                  <Text>ZN</Text>
                </AvatarFallback>
              </Avatar>
              <Avatar
                alt="@leerob"
                className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                <AvatarImage source={{ uri: 'https://github.com/leerob.png' }} />
                <AvatarFallback>
                  <Text>LR</Text>
                </AvatarFallback>
              </Avatar>
              <Avatar
                alt="@evilrabbit"
                className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                <AvatarImage source={{ uri: 'https://github.com/evilrabbit.png' }} />
                <AvatarFallback>
                  <Text>ER</Text>
                </AvatarFallback>
              </Avatar>
              <Avatar
                alt="@mrzachnugent"
                className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
                <AvatarFallback>
                  <Text>ZN</Text>
                </AvatarFallback>
              </Avatar>
              <Avatar
                alt="@leerob"
                className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                <AvatarImage source={{ uri: 'https://github.com/leerob.png' }} />
                <AvatarFallback>
                  <Text>LR</Text>
                </AvatarFallback>
              </Avatar>
              <Avatar
                alt="@evilrabbit"
                className="-mr-2 h-6 w-6 border-2 border-background web:border-0 web:ring-2 web:ring-background">
                <AvatarImage source={{ uri: 'https://github.com/evilrabbit.png' }} />
                <AvatarFallback>
                  <Text>ER</Text>
                </AvatarFallback>
              </Avatar>
              <Avatar
                alt="@evilrabbit"
                className="-mr-2 h-6 w-6 border-2 border-background bg-[#F4F4F5] web:border-0 web:ring-2 web:ring-background">
                <AvatarFallback>
                  <Text className="font-cabinet-bold text-xs">+2</Text>
                </AvatarFallback>
              </Avatar>
            </View>

            <Pressable
              onPress={() => router.navigate('/book/offer')}
              className="flex flex-row items-center gap-1">
              <Text className="font-cabinet-bold text-sm text-primary">See offers</Text>

              <ArrowUpRight size={14} color={'#FE6A00'} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
