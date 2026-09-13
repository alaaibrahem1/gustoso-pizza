/**
 * Centralized currency formatting for Gustoso Pizza Co. (Saudi Market: SAR / ر.س)
 * All price displays across the app must use these helpers.
 */

export const CURRENCY_CODE = 'SAR';
export const CURRENCY_SYMBOL = 'SAR';
export const CURRENCY_SYMBOL_AR = 'ر.س';

interface CurrencyFormatOptions {
  showCode?: boolean;
  arabic?: boolean;
  decimals?: number;
}

/**
 * Formats a numeric price into standard Saudi Riyal notation.
 * e.g., formatSAR(58.5) => "58.50 SAR"
 */
export function formatSAR(amount: number | undefined | null, options?: CurrencyFormatOptions): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const decimals = options?.decimals !== undefined ? options.decimals : 2;
  const formattedNumber = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options?.arabic) {
    return `${formattedNumber} ${CURRENCY_SYMBOL_AR}`;
  }

  return `${formattedNumber} ${CURRENCY_SYMBOL}`;
}

/**
 * Standard default price formatter used across UI components
 */
export function formatPrice(amount: number | undefined | null): string {
  return formatSAR(amount);
}

/**
 * Arabic price formatter
 */
export function formatPriceAR(amount: number | undefined | null): string {
  return formatSAR(amount, { arabic: true });
}
