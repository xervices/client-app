import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { Layout } from '@/components/layout';
import { useNavigation, usePathname } from 'expo-router';
import { SheetManager } from 'react-native-actions-sheet';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Image } from 'expo-image';

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
  const pathname = usePathname();
  const navigation = useNavigation();

  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    if (pathname === '/jobs/ongoing') {
      SheetManager.show('ongoing-job-sheet');
    } else {
      SheetManager.hide('ongoing-job-sheet');
    }
  }, [pathname]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      SheetManager.hide('ongoing-job-sheet');
    });

    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

  return (
    <Layout useBackground scrollable={false} horizontalPadding={false} bottomPadding={0}>
      <View className="flex-1">
        <View className="relative flex flex-1 items-center justify-center">
          {/* <Image
            source={require('@/assets/images/map-view.svg')}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          /> */}

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

          <View className="absolute top-7 flex h-[76px] w-[250px] items-center justify-center rounded-full border border-[#DFDFE1] bg-white">
            <Text className="text-center font-cabinet-bold text-xl text-[#1B1B1E]">
              Tracking Sarah
            </Text>

            <Text className="text-center text-xs text-[#1B1B1E]">Plumber</Text>
          </View>
        </View>
        {/* <View className="h-[25%] w-full bg-white"></View> */}
      </View>
    </Layout>
  );
}
