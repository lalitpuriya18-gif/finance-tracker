import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  parseMoneyToMinor,
  minorToDecimal,
} from '../lib/currency';

describe('Currency and Minor Units Conversion', () => {
  it('formats positive and negative amounts correctly in USD', () => {
    expect(formatMoney(1250, 'USD')).toBe('$12.50');
    expect(formatMoney(-4500, 'USD')).toBe('-$45.00');
    expect(formatMoney(0, 'USD')).toBe('$0.00');
    expect(formatMoney(1050, 'USD', { showSign: true })).toBe('+$10.50');
    expect(formatMoney(-1050, 'USD', { absolute: true })).toBe('$10.50');
  });

  it('formats zero-decimal currencies like JPY without decimal places', () => {
    expect(formatMoney(2500, 'JPY')).toBe('¥2,500');
    expect(formatMoney(-500, 'JPY')).toBe('-¥500');
  });

  it('parses decimal string inputs into precise integer minor units', () => {
    expect(parseMoneyToMinor('12.50', 'USD')).toBe(1250);
    expect(parseMoneyToMinor('$1,234.56', 'USD')).toBe(123456);
    expect(parseMoneyToMinor('0.99', 'USD')).toBe(99);
    expect(parseMoneyToMinor('500', 'JPY')).toBe(500);
    expect(parseMoneyToMinor(45.99, 'USD')).toBe(4599);
  });

  it('converts minor units back to decimal numbers for charts and inputs', () => {
    expect(minorToDecimal(1250, 'USD')).toBe(12.5);
    expect(minorToDecimal(500, 'JPY')).toBe(500);
    expect(minorToDecimal(99, 'USD')).toBe(0.99);
  });
});
