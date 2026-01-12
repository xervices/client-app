import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
