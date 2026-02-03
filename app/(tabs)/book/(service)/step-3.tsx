import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as Contacts from 'expo-contacts';
import { useAuthStore } from '@/store/auth-store';
import { useCurrentLocation } from 'solomo';
import * as Location from 'expo-location';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import EnableLocationDialog from '@/components/enable-location-dialog';
import { useServiceStore } from '@/store/service-store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { SheetManager } from 'react-native-actions-sheet';

export default function Screen() {
  const { user } = useAuthStore();
  const { setStep3, getFormData } = useServiceStore();
  const { fetchLocation } = useCurrentLocation();

  const [serviceAddress, setServiceAddress] = React.useState('');
  const [latitude, setLatitude] = React.useState<number>();
  const [longitude, setLongitude] = React.useState<number>();
  const [contactPhone, setContactPhone] = React.useState(
    user?.phoneVerified ? user?.phoneNumber : undefined
  );
  const [loadingLocation, setLoadingLocation] = React.useState(false);

  const { mutate, isPending } = useMutation(api.createServiceRequest());
  const { refetch } = useQuery(api.getUserServiceRequests());

  const getContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      Contacts.presentContactPickerAsync().then((res) => {
        setContactPhone(res?.phoneNumbers?.[0]?.number);
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const res = await fetchLocation();

      if (res.location?.coords.latitude && res.location?.coords.longitude) {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: res.location?.coords.latitude,
          longitude: res.location?.coords.longitude,
        });

        setLatitude(res.location?.coords.latitude);
        setLongitude(res.location?.coords.longitude);

        // formattedAddress is only available on Android, so we construct it manually for iOS
        const formattedAddress =
          address.formattedAddress ||
          [
            address.streetNumber,
            address.street,
            address.city,
            address.region,
            address.postalCode,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

        setServiceAddress(formattedAddress);
      }
    } catch (err) {
      showErrorMessage("Failed to get current location ensure you've granted location permission.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleOnSubmit = () => {
    if (!contactPhone || !latitude || !longitude || !serviceAddress)
      return showErrorMessage('Complete the form before proceeding.');
    setStep3({
      contactPhone,
      latitude,
      longitude,
      serviceAddress,
    });

    const data = getFormData();

    // @ts-ignore
    mutate(data, {
      onSuccess: (res) => {
        showSuccessMessage('Service created successfully...');
        refetch();
        router.replace({
          pathname: '/book/searching',
          params: {
            id: res.serviceRequest.id,
          },
        });
      },
      onError: (err) => {
        // console.log(err);
        showErrorMessage(err.message);
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View className="flex flex-1 gap-4 bg-white">
        <Text className="text-center font-cabinet-bold text-xs text-[#B4B4BC]">Step 3 of 3</Text>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">My Location</Text>

          <Text className="text-sm leading-none text-[#737381]">Please confirm your Location.</Text>

          <View className="flex gap-2">
            <Pressable
              onPress={() =>
                SheetManager.show('location-search-sheet', {
                  payload: {
                    onSelect: (location) => {
                      setLatitude(Number(location.latitude));
                      setLongitude(Number(location.longitude));
                      setServiceAddress(location.address);
                    },
                  },
                })
              }
              className="flex h-[52px] flex-row items-center gap-2 rounded-sm border border-[#DFDFE1] px-4">
              <View className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE6A00]">
                <View className="h-2 w-2 rounded-full bg-white" />
              </View>

              {serviceAddress ? (
                <Text className="flex-1" numberOfLines={1}>
                  {serviceAddress}
                </Text>
              ) : (
                <Text className="flex-1 text-[#B4B4BC]" numberOfLines={1}>
                  Enter your location
                </Text>
              )}
            </Pressable>

            <View className="flex flex-row">
              {loadingLocation ? (
                <LoadingIndicator size={12} />
              ) : (
                <Pressable
                  onPress={handleGetCurrentLocation}
                  className="flex flex-row items-center gap-2">
                  <View className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#FFF4EA]">
                    <Image
                      source={require('@/assets/icons/picture-frame.svg')}
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                    />
                  </View>

                  <Text className="font-cabinet-bold text-xs text-[#FE6A00]">
                    My current address
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View className="flex gap-2">
          <Text className="font-cabinet-bold leading-none text-[#737381]">Phone Number</Text>

          <Text className="text-sm leading-none text-[#737381]">
            Confirm number or available contact
          </Text>

          <Input
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={contactPhone}
            onChangeText={setContactPhone}
            className="bg-white"
            rightIcon={
              <Pressable onPress={getContact}>
                <Image
                  source={require('@/assets/icons/contact-calendar.svg')}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
              </Pressable>
            }
          />
        </View>

        <Button
          disabled={!serviceAddress || !contactPhone || !longitude || !latitude || isPending}
          isLoading={isPending}
          onPress={handleOnSubmit}
          className="mt-auto">
          Continue
        </Button>
      </View>

      <EnableLocationDialog />
    </ScrollView>
  );
}
