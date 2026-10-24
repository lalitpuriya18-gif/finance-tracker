import { CurrencyCode } from '../types/finance';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
  locale: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2, locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', decimals: 2, locale: 'en-AU' },
};

/**
 * Converts integer minor units (e.g. cents/paise) to human-readable formatted string.
 * Example: 48245000 paise INR -> "₹4,82,450.00"
 */
export function formatMoney(
  minorUnits: number,
  currency: CurrencyCode = 'INR',
  options?: { showSign?: boolean; absolute?: boolean; hideDecimals?: boolean }
): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  const isNegative = minorUnits < 0;
  const absAmount = Math.abs(minorUnits);

  const factor = Math.pow(10, config.decimals);
  const decimalValue = absAmount / factor;

  const fractionDigits = options?.hideDecimals ? 0 : config.decimals;

  const formattedNumber = decimalValue.toLocaleString(config.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  if (options?.absolute) {
    return `${config.symbol}${formattedNumber}`;
  }

  if (isNegative) {
    return `-${config.symbol}${formattedNumber}`;
  }

  if (options?.showSign && minorUnits > 0) {
    return `+${config.symbol}${formattedNumber}`;
  }

  return `${config.symbol}${formattedNumber}`;
}

/**
 * Converts user decimal input string to integer minor units safely.
 * Example: "1,45,000.00" -> 14500000; "890" -> 89000
 */
export function parseMoneyToMinor(
  input: string | number,
  currency: CurrencyCode = 'INR'
): number {
  if (typeof input === 'number') {
    const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
    const factor = Math.pow(10, config.decimals);
    return Math.round(input * factor);
  }

  if (!input) return 0;

  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  const factor = Math.pow(10, config.decimals);

  let cleaned = input.toString().replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return 0;

  const floatVal = parseFloat(cleaned);
  if (isNaN(floatVal)) return 0;

  return Math.round(floatVal * factor);
}

/**
 * Converts minor units to decimal number for input values or charts
 */
export function minorToDecimal(
  minorUnits: number,
  currency: CurrencyCode = 'INR'
): number {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  const factor = Math.pow(10, config.decimals);
  return minorUnits / factor;
}
