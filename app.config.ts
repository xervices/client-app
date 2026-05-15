/* eslint-disable max-lines-per-function */
import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';
import { version } from './package.json';

const EAS_PROJECT_ID = '8d392d19-984f-472a-8eea-23beb3881c25';
const PROJECT_SLUG = 'xervices';
const OWNER = 'xervices';
const BUNDLE_IDENTIFIER = 'com.xervices.client'; // ios bundle id
const PACKAGE_NAME = 'com.xervices.client'; // android package name
const APP_NAME = 'Xervices'; // app name
const SCHEME = 'xervices'; // app scheme

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: process.env.APP_ENV !== 'production',
  badges: [
    {
      text: process.env.APP_ENV ?? 'development',
      type: 'banner',
      color: 'white',
    },
    {
      text: version,
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const {
    name,
    bundleIdentifier,
    packageName,
    scheme,
    googleServicesFile,
    googleMapsApiKey,
    iosUrlScheme,
    iosGoogleMapsApiKey,
  } = getDynamicAppConfig(
    (process.env.APP_ENV as 'development' | 'preview' | 'production') || 'development'
  );

  return {
    ...config,
    name: name,
    description: `${name} Mobile App`,
    owner: OWNER,
    scheme: scheme,
    slug: PROJECT_SLUG,
    version: version, // Automatically bump your project version with `pnpm version patch`, `pnpm version minor` or `pnpm version major`.
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#E15D02',
      imageWidth: 600,
    },
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      config: {
        googleMapsApiKey: iosGoogleMapsApiKey,
      },
    },
    experiments: {
      typedRoutes: true,
    },
    android: {
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/splash.png',
        backgroundColor: '#E15D02',
      },
      package: packageName,
      googleServicesFile,
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      softwareKeyboardLayoutMode: 'pan',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/CabinetGrotesk-Thin.otf',
            './assets/fonts/CabinetGrotesk-Extralight.otf',
            './assets/fonts/CabinetGrotesk-Light.otf',
            './assets/fonts/CabinetGrotesk-Regular.otf',
            './assets/fonts/CabinetGrotesk-Medium.otf',
            './assets/fonts/CabinetGrotesk-Bold.otf',
            './assets/fonts/CabinetGrotesk-Extrabold.otf',
            './assets/fonts/CabinetGrotesk-Black.otf',
          ],
        },
      ],
      'expo-router',
      ['app-icon-badge', appIconBadgeConfig],
      'expo-sqlite',
      'expo-video',
      [
        'expo-location',
        {
          locationWhenInUsePermission: `${name} uses your location to match you with nearby service providers and show accurate travel routes and ETAs during a booking.`,
        },
      ],
      'expo-notifications',
      [
        'expo-camera',
        {
          cameraPermission: `${name} uses your camera to take a profile photo, capture before and after photos of a service, and attach photo or video evidence when you open a dispute.`,
          microphonePermission: `${name} uses your microphone to record audio while you capture video of a service or dispute, for example a short clip showing the condition of the work area.`,
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-contacts',
        {
          contactsPermission: `${name} accesses your contacts so you can quickly invite friends to the app and share a service booking with them.`,
        },
      ],
      [
        'expo-audio',
        {
          microphonePermission: `${name} uses your microphone to record audio alongside video, for example when you capture a short clip of the service area to include with a booking or dispute.`,
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: `${name} accesses your photo library so you can choose a profile picture and attach existing photos to a service booking or dispute.`,
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: iosUrlScheme,
        },
      ],
      'expo-apple-authentication',
    ],
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
  };
};

export const getDynamicAppConfig = (environment: 'development' | 'preview' | 'production') => {
  if (environment === 'production') {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      scheme: SCHEME,
      googleServicesFile: './prod-google-services.json',
      googleMapsApiKey: 'AIzaSyDA7HnZnWADQ3h1AYCUgCLAccJGPJo67gU',
      iosUrlScheme: 'com.googleusercontent.apps.254247444720-svvp7snle85nn3giielj7r9cmftm1ofv',
      iosGoogleMapsApiKey: 'AIzaSyCebyLUsUxuLwTbvQFDKFaHF4B_Hz_lVT8',
    };
  }

  if (environment === 'preview') {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      scheme: `${SCHEME}-prev`,
      googleServicesFile: './preview-google-services.json',
      googleMapsApiKey: 'AIzaSyDA7HnZnWADQ3h1AYCUgCLAccJGPJo67gU',
      iosUrlScheme: 'com.googleusercontent.apps._some_id_here_',
      iosGoogleMapsApiKey: 'AIzaSyCebyLUsUxuLwTbvQFDKFaHF4B_Hz_lVT8',
    };
  }

  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    scheme: `${SCHEME}-dev`,
    googleServicesFile: './dev-google-services.json',
    googleMapsApiKey: 'AIzaSyDA7HnZnWADQ3h1AYCUgCLAccJGPJo67gU',
    iosUrlScheme: 'com.googleusercontent.apps.254247444720-nk2nrjvqda0r37s9kudt7embqirg3efu',
    iosGoogleMapsApiKey: 'AIzaSyCebyLUsUxuLwTbvQFDKFaHF4B_Hz_lVT8',
  };
};
