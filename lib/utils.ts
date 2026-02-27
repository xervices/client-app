import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { showErrorMessage, showSuccessMessage } from '@/api/helpers';
import { Linking, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Nigerian Naira currency
 * @param amount - Amount to format (can be undefined/null)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "₦5,200.00")
 */
export function formatCurrency(
  amount: number | undefined | null,
  options?: {
    showDecimals?: boolean;
    showSymbol?: boolean;
    placeholder?: string;
  }
): string {
  const { showDecimals = false, showSymbol = true, placeholder = '₦0' } = options || {};

  // Handle undefined/null values
  if (amount === undefined || amount === null) {
    return placeholder;
  }

  // Handle non-numeric values
  if (isNaN(amount)) {
    return placeholder;
  }

  // Format the number with commas
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  // Add currency symbol
  return showSymbol ? `₦${formatted}` : formatted;
}

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

// Customize the relative time strings to match your desired format
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '%d sec',
    m: '1 min',
    mm: '%d min',
    h: '1 hour',
    hh: '%d hours',
    d: '1 day',
    dd: '%d days',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years',
  },
});

/**
 * Formats an ISO date string as a relative time (e.g., "2 sec ago", "5 min ago")
 * @param isoDateString - ISO 8601 date string (optional)
 * @returns Formatted relative time string or fallback message
 */
export function formatRelativeTime(isoDateString?: string | null): string {
  // Handle undefined or null input
  if (!isoDateString) {
    return 'N/A';
  }

  const date = dayjs(isoDateString);

  // Validate the date
  if (!date.isValid()) {
    console.warn(`Invalid date string: ${isoDateString}`);
    return 'Invalid date';
  }

  return date.fromNow();
}

/**
 * Extract file extension from URI or derive from MIME type
 * Works for images, videos, and other file types
 *
 * @param uri - File URI (e.g., 'file:///path/to/video.mp4' or 'content://...')
 * @param mimeType - File MIME type (e.g., 'video/mp4', 'image/jpeg')
 * @returns File extension without dot (e.g., 'mp4', 'jpg')
 */
export function getFileExtension(uri: string, mimeType?: string): string {
  // Try to extract extension from URI first
  const uriMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);

  if (uriMatch) {
    return uriMatch[1].toLowerCase();
  }

  // Fallback: derive extension from MIME type
  if (mimeType) {
    const mimeToExt: Record<string, string> = {
      // Images
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/heic': 'heic',
      'image/heif': 'heif',

      // Videos
      'video/mp4': 'mp4',
      'video/mpeg': 'mpeg',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/x-matroska': 'mkv',
      'video/webm': 'webm',
      'video/3gpp': '3gp',
      'video/x-flv': 'flv',
      'video/x-ms-wmv': 'wmv',

      // Audio
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/aac': 'aac',
      'audio/flac': 'flac',
      'audio/mp4': 'm4a',

      // Documents
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
      'application/json': 'json',
      'application/zip': 'zip',
      'application/x-rar-compressed': 'rar',
    };

    const ext = mimeToExt[mimeType.toLowerCase()];
    if (ext) {
      return ext;
    }
  }

  // Last resort: return generic extension based on MIME type category
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'jpg';
    if (mimeType.startsWith('video/')) return 'mp4';
    if (mimeType.startsWith('audio/')) return 'mp3';
    if (mimeType.startsWith('application/')) return 'bin';
  }

  // Ultimate fallback
  return 'bin';
}

/**
 * Formats an ISO date string as "Today, Oct 11, 2025" or "Oct 11, 2025"
 * @param isoDateString - ISO 8601 date string (e.g., "2025-10-11T14:30:00Z")
 * @returns Formatted date string or undefined if input is invalid/undefined
 */
export function formatDate(isoDateString: string | undefined | null): string | undefined {
  // Handle undefined, null, or empty string
  if (!isoDateString) {
    return undefined;
  }

  const date = dayjs(isoDateString);

  // Check if the date is valid
  if (!date.isValid()) {
    return undefined;
  }

  // Format the date part (e.g., "Oct 11, 2025")
  const formattedDate = date.format('MMM D, YYYY');

  // Add "Today" or "Yesterday" prefix if applicable
  if (date.isToday()) {
    return `Today, ${formattedDate}`;
  } else if (date.isYesterday()) {
    return `Yesterday, ${formattedDate}`;
  }

  return formattedDate;
}

/**
 * Formats an ISO date string to 'YYYY-MM-DD HH:mm:ss' format
 * @param isoString - ISO 8601 date string (e.g., '2025-11-27T17:47:27.000Z')
 * @returns Formatted date string (e.g., '2025-11-27 17:47:27') or null if invalid
 */
export function formatDateTime(isoString?: string | null): string | null {
  if (!isoString) {
    return null;
  }

  try {
    const date = new Date(isoString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return null;
  }
}

export function formatTime12HourIntl(isoString?: string | null): string | null {
  if (!isoString) {
    return null;
  }

  try {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      return null;
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return formatter.format(date).toLowerCase();
  } catch (error) {
    return null;
  }
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Address {
  formattedAddress: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  neighborhood?: string;
  district?: string;
}

/**
 * Get address from coordinates using Google Geocoding API
 * Reverse geocoding - converts lat/lng to address
 */
export async function getAddressFromCoordinatesGoogle(coordinates: Coordinates): Promise<Address> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key not found');
  }

  const { latitude, longitude } = coordinates;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No address found for these coordinates');
    }

    const result = data.results[0];
    const components = result.address_components;

    // Extract address components
    const address: Address = {
      formattedAddress: result.formatted_address,
    };

    components.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number') || types.includes('route')) {
        address.street = (address.street || '') + ' ' + component.long_name;
      }
      if (types.includes('locality')) {
        address.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
      }
      if (types.includes('postal_code')) {
        address.postalCode = component.long_name;
      }
      if (types.includes('neighborhood')) {
        address.neighborhood = component.long_name;
      }
      if (types.includes('sublocality')) {
        address.district = component.long_name;
      }
    });

    // Clean up street
    if (address.street) {
      address.street = address.street.trim();
    }

    return address;
  } catch (error) {
    console.error('Error getting address:', error);
    throw error;
  }
}

interface TravelTimeResult {
  distanceKm: number;
  distanceMiles: number;
  durationMinutes: number;
  durationFormatted: string;
  mode: 'driving' | 'walking' | 'cycling';
}

/**
 * Calculate travel time using Google Distance Matrix API
 * Provides real-time traffic and actual road distances
 */
export async function getTravelTimeGoogle(
  origin: Coordinates,
  destination: Coordinates,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<TravelTimeResult> {
  // const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const apiKey = 'AIzaSyDkT-0SiaW_dZq_ydeOTZAsKT6IvSgLp5Q';

  if (!apiKey) {
    throw new Error('Google Maps API key not found');
  }

  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&mode=${mode}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status}`);
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`No route found: ${element.status}`);
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;

    const distanceKm = distanceMeters / 1000;
    const distanceMiles = distanceKm * 0.621371;
    const durationMinutes = Math.round(durationSeconds / 60);

    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      distanceMiles: Number(distanceMiles.toFixed(2)),
      durationMinutes,
      durationFormatted: formatDuration(durationMinutes),
      mode: mode === 'bicycling' ? 'cycling' : (mode as any),
    };
  } catch (error) {
    console.error('Error fetching travel time:', error);
    throw error;
  }
}

/**
 * Format duration in minutes to human-readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export const makePhoneCall = async (phoneNumber: string | undefined) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    showErrorMessage('Phone number is not available');
    return;
  }

  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');

  if (cleanNumber.length === 0) {
    showErrorMessage('Invalid phone number');
    return;
  }

  // Normalise to international format with Nigeria's +234 country code
  let internationalNumber: string;
  if (cleanNumber.startsWith('+')) {
    // Already has a country code — use as-is
    internationalNumber = cleanNumber;
  } else if (cleanNumber.startsWith('234')) {
    // Has country code digits but no leading +
    internationalNumber = `+${cleanNumber}`;
  } else if (cleanNumber.startsWith('0')) {
    // Local format (e.g. 08012345678) — strip the leading 0 and prepend +234
    internationalNumber = `+234${cleanNumber.slice(1)}`;
  } else {
    // Assume a bare local number with no leading 0 (e.g. 8012345678)
    internationalNumber = `+234${cleanNumber}`;
  }

  const phoneUrl = `tel:${internationalNumber}`;

  try {
    if (Platform.OS === 'android') {
      await Linking.openURL(phoneUrl);
    } else {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        showErrorMessage('Phone calls are not supported on this device');
      }
    }
  } catch (err) {
    console.error('Error making phone call:', err);
    showErrorMessage('Unable to make phone call');
  }
};

export const copyToClipboard = async (text?: string) => {
  if (text) {
    const status = await Clipboard.setStringAsync(text);

    if (status) {
      showSuccessMessage('Copied successfully...');
    } else {
      showErrorMessage('Failed to copy...');
    }
  }
};

interface DeviceInfo {
  deviceId: string | null;
  deviceName: string | null;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const deviceName = Device.deviceName;

  let deviceId: string | null = null;

  if (Platform.OS === 'android') {
    deviceId = Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    deviceId = await Application.getIosIdForVendorAsync();
  }

  return { deviceId, deviceName };
};
