import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

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
