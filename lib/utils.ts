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
