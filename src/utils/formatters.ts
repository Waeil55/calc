import { formatResult } from './mathEngine';
import { format as fnsFormat, formatDistanceToNow } from 'date-fns';

interface FormatOptions {
  precision?: number;
  thousandsSeparator?: boolean;
  numberFormat?: 'comma-dot' | 'dot-comma';
}

export function formatNumber(
  value: number | string,
  optionsOrPrecision: FormatOptions | number = 10,
  useThousands: boolean = true,
  numberFormat: 'comma-dot' | 'dot-comma' = 'comma-dot'
): string {
  if (typeof optionsOrPrecision === 'object') {
    const { precision = 10, thousandsSeparator = true, numberFormat: fmt = 'comma-dot' } = optionsOrPrecision;
    return formatResult(value, precision, thousandsSeparator, fmt);
  }
  return formatResult(value, optionsOrPrecision, useThousands, numberFormat);
}

export function formatCurrency(
  value: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

export function formatDate(timestamp: number, pattern: string = 'MMM d, yyyy'): string {
  return fnsFormat(new Date(timestamp), pattern);
}

export function formatTimeAgo(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function prettifyExpression(expr: string): string {
  return expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/pi/gi, 'π')
    .replace(/sqrt\(/g, '√(')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³');
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
