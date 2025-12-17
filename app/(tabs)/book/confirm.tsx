import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';
import { Image } from 'expo-image';
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  Dot,
  Map,
  MapPin,
  Trash,
  Trash2,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Button } from '@/components/ui/button';
import { SheetManager } from 'react-native-actions-sheet';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const routeCoordinates = [
  { latitude: 37.78825, longitude: -122.4324 }, // Start point
  { latitude: 37.78625, longitude: -122.4304 },
  { latitude: 37.78425, longitude: -122.4284 },
  { latitude: 37.78225, longitude: -122.4264 },
  { latitude: 37.78025, longitude: -122.4244 },
  { latitude: 37.77825, longitude: -122.4224 },
  { latitude: 37.77625, longitude: -122.4204 }, // End point
];

export default function Screen() {
  const [promoCode, setPromoCode] = React.useState('');
  const [useReferralReward, setUseReferralReward] = React.useState(false);

  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="Confirm Booking" />
        </View>
      }>
      <View className="flex-1 gap-4">
        <View className="flex gap-2 rounded-[8px] border border-[#DFDFE1] p-2">
          <View className="relative aspect-[311/120] w-full overflow-hidden rounded-[8px]">
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ width: '100%', height: '100%' }}
              initialRegion={{
                latitude: 37.78225,
                longitude: -122.4264,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}>
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#FE6A00" // Orange color
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />

              <Marker coordinate={routeCoordinates[0]} anchor={{ x: 0.5, y: 1 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 99999999,
                    backgroundColor: '#FFDCC1',
                    borderWidth: 1,
                    borderColor: '#606D5D1F',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}>
                  <Image
                    style={{ width: 16, height: 16 }}
                    contentFit="contain"
                    source={require('@/assets/icons/map-pin.svg')}
                  />
                </View>
              </Marker>

              <Marker
                coordinate={routeCoordinates[routeCoordinates.length - 1]}
                anchor={{ x: 0.5, y: 0.5 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 99999999,
                    backgroundColor: '#1B1B1E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}>
                  <Image
                    style={{ width: 16, height: 16 }}
                    contentFit="contain"
                    source={require('@/assets/icons/map-home.svg')}
                  />
                </View>
              </Marker>
            </MapView>

            <View className="absolute right-2 top-2 flex h-6 flex-row items-center justify-center rounded-sm bg-[#FFF4EA] px-2">
              <Text className="font-cabinet-bold text-xs leading-none text-[#FE6A00]">
                7 mins away
              </Text>
            </View>
          </View>

          <View>
            <View className="relative flex flex-row items-center justify-between pb-5">
              <View className="flex flex-row items-center gap-1">
                <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B4B4BC]">
                  <View className="h-2 w-2 rounded-full bg-white" />
                </View>

                <Text className="text-xs leading-none text-[#737381]">Choba, Port Harcourt</Text>
              </View>

              <Text className="text-xs leading-none text-[#737381]">Date: Today, Oct 11, 2025</Text>

              <View className="absolute bottom-0 left-1.5 h-5 w-0.5 bg-[#FFCFAD]" />
            </View>

            <View className="relative flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-1">
                <Image
                  source={require('@/assets/icons/location-primary.svg')}
                  style={{ width: 16, height: 16 }}
                  contentFit="contain"
                />

                <Text className="text-xs leading-none text-[#737381]">
                  Wogi street, Gra, Port Harcourt
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex w-full flex-row">
          <View className="flex flex-1 flex-row items-center gap-2">
            <Avatar alt="User's Avatar" className="h-14 w-14">
              <AvatarImage source={{ uri: 'https://github.com/mrzachnugent.png' }} />
              <AvatarFallback className="bg-primary">
                <Text className="font-cabinet-bold leading-none">ZN</Text>
              </AvatarFallback>
            </Avatar>

            <View>
              <View className="flex flex-row items-center">
                <Text className="font-cabinet-bold text-[18px] text-[#1B1B1E]">Sarah Rodri</Text>

                <BadgeCheck size={16} fill={'#FE6A00'} stroke={'#FFFFFF'} />
              </View>

              <Text className="text-sm text-[#737381]">Plumber</Text>

              <Text className="text-xs text-[#FF6A00]">4.9 ★ (145)</Text>
            </View>
          </View>

          <View className="flex w-1/2 justify-between">
            <Text className="text-right font-cabinet-bold text-[18px] text-[#FF6A00]">₦8500</Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-between">
          <Text className="text-sm leading-none text-[#737381]">Promos</Text>

          {promoCode ? (
            <Pressable
              className="flex flex-row items-center gap-2"
              onPress={() => setPromoCode('')}>
              <Text className="text-sm leading-none text-[#FF6A00]">{promoCode}</Text>

              <Trash2 size={16} color={'#B3031E'} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                SheetManager.show('add-promo-code-sheet', {
                  payload: {
                    onAdd(code) {
                      setPromoCode(code);
                    },
                  },
                })
              }>
              <Text className="text-sm leading-none text-[#FF6A00]">Add code</Text>
            </Pressable>
          )}
        </View>

        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center">
            <Text className="text-sm leading-none text-[#737381]">Referral Reward</Text>

            <Dot size={16} color={'#FF6A00'} />

            <Text className="text-sm leading-none text-[#FF6A00]">₦0.00</Text>
          </View>

          <Pressable
            className={`flex h-4 w-4 flex-row items-center justify-center rounded-full border-2 ${useReferralReward ? 'border-[#FE6A00]' : 'border-[#737381]'} `}
            onPress={() => setUseReferralReward((prev) => !prev)}>
            {useReferralReward && <View className="h-2 w-2 rounded-full bg-[#FE6A00]" />}
          </Pressable>
        </View>

        <View className="flex flex-row items-center justify-between border-y border-[#F4F4F5] py-4">
          <Text className="text-sm leading-none text-[#737381]">Booking Date & Time</Text>

          <Text className="text-sm leading-none text-[#737381]">2025-11-27 17:47:27</Text>
        </View>

        {promoCode && (
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm leading-none text-[#737381]">Promo Discount</Text>

            <Text className="text-sm leading-none text-[#FE6A00]">-₦500</Text>
          </View>
        )}

        {useReferralReward && (
          <View className="flex flex-row items-center justify-between">
            <Text className="text-sm leading-none text-[#737381]">Referral Discount</Text>

            <Text className="text-sm leading-none text-[#FE6A00]">-₦1000</Text>
          </View>
        )}

        <View className="flex flex-row items-center justify-between">
          <Text className="text-sm leading-none text-[#737381]">Total Price</Text>

          <Text className="text-sm leading-none text-[#FE6A00]">₦7000</Text>
        </View>

        <Text className="text-sm text-[#737381]">
          Your payment will be held securely in escrow until the job is completed and approved.
          Funds are released only after you confirm the job is complete. Cancellations made after
          your pro is on the way may be subject to a{' '}
          <Text className="text-sm text-[#FE6A00]"> cancellation fee.</Text>{' '}
        </Text>

        <View className="flex flex-row gap-2 rounded-[8px] border border-[#0582F1] bg-[#EAF5FF] p-2">
          <CircleAlert size={20} color={'#0582F1'} />

          <Text className="flex-1 text-sm text-[#014178]">
            Prices cover service only. Materials, if needed, are handled between you and the pro.
            Xervices does not provide or charge for them.
          </Text>
        </View>

        <Button>Proceed to payment</Button>
      </View>
    </Layout>
  );
}
