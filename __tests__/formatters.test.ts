/**
 * Unit tests for formatters utility.
 */
import { formatNumber, formatCurrency, formatTimeAgo } from '@/utils/formatters';

describe('formatters — formatNumber()', () => {
  it('formats integer with thousands separator', () => {
    const result = formatNumber(1000000, { thousandsSeparator: true });
    expect(result).toBe('1,000,000');
  });

  it('formats decimal number to specified precision', () => {
    const result = formatNumber(3.14159265, { precision: 2 });
    expect(result).toBe('3.14');
  });

  it('formats zero correctly', () => {
    const result = formatNumber(0);
    expect(result).toBe('0');
  });

  it('formats negative numbers', () => {
    const result = formatNumber(-42.5, { precision: 1 });
    expect(result).toBe('-42.5');
  });

  it('handles large numbers', () => {
    const result = formatNumber(9999999.99, { precision: 2, thousandsSeparator: true });
    expect(result).toBe('9,999,999.99');
  });

  it('handles very small numbers without scientific notation if below threshold', () => {
    const result = formatNumber(0.001, { precision: 4 });
    expect(result).toBe('0.001');
  });
});

describe('formatters — formatCurrency()', () => {
  it('formats USD correctly', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toContain('1,234.56');
  });

  it('formats EUR correctly', () => {
    const result = formatCurrency(999.9, 'EUR');
    // Should contain the numeric value
    expect(result).toContain('999.9');
  });

  it('formats zero currency', () => {
    const result = formatCurrency(0, 'USD');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('handles negative currency', () => {
    const result = formatCurrency(-50, 'USD');
    expect(result).toContain('50');
  });
});

describe('formatters — formatTimeAgo()', () => {
  it('returns "just now" for very recent timestamps', () => {
    const now = Date.now();
    const result = formatTimeAgo(now);
    expect(result.toLowerCase()).toMatch(/just now|seconds? ago|now/);
  });

  it('returns minutes for 5 minutes ago', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const result = formatTimeAgo(fiveMinutesAgo);
    expect(result.toLowerCase()).toMatch(/min/);
  });

  it('returns hours for 2 hours ago', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const result = formatTimeAgo(twoHoursAgo);
    expect(result.toLowerCase()).toMatch(/hour/);
  });

  it('returns days for timestamps older than 1 day', () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    const result = formatTimeAgo(twoDaysAgo);
    expect(result.toLowerCase()).toMatch(/day/);
  });
});
