import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkvAdapter';
import type { CurrencyRate } from '@/types';

interface CurrencyState {
  rates: Record<string, number>;
  currencies: CurrencyRate[];
  lastUpdated: number | null;
  baseCurrency: string;
  isLoading: boolean;
  error: string | null;
  fetchRates: (base?: string) => Promise<void>;
  getCachedRate: (from: string, to: string) => number | null;
  setBaseCurrency: (code: string) => void;
}

const CURRENCY_NAMES: Record<string, { name: string; flag: string }> = {
  USD: { name: 'US Dollar', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  GBP: { name: 'British Pound', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', flag: '🇮🇳' },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽' },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷' },
  KRW: { name: 'South Korean Won', flag: '🇰🇷' },
  SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
  HKD: { name: 'Hong Kong Dollar', flag: '🇭🇰' },
  NOK: { name: 'Norwegian Krone', flag: '🇳🇴' },
  SEK: { name: 'Swedish Krona', flag: '🇸🇪' },
  DKK: { name: 'Danish Krone', flag: '🇩🇰' },
  NZD: { name: 'New Zealand Dollar', flag: '🇳🇿' },
  ZAR: { name: 'South African Rand', flag: '🇿🇦' },
  RUB: { name: 'Russian Ruble', flag: '🇷🇺' },
  TRY: { name: 'Turkish Lira', flag: '🇹🇷' },
  THB: { name: 'Thai Baht', flag: '🇹🇭' },
  PLN: { name: 'Polish Zloty', flag: '🇵🇱' },
  TWD: { name: 'Taiwan Dollar', flag: '🇹🇼' },
  SAR: { name: 'Saudi Riyal', flag: '🇸🇦' },
  AED: { name: 'UAE Dirham', flag: '🇦🇪' },
  ILS: { name: 'Israeli Shekel', flag: '🇮🇱' },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭' },
  CZK: { name: 'Czech Koruna', flag: '🇨🇿' },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  MYR: { name: 'Malaysian Ringgit', flag: '🇲🇾' },
  HUF: { name: 'Hungarian Forint', flag: '🇭🇺' },
  CLP: { name: 'Chilean Peso', flag: '🇨🇱' },
  ARS: { name: 'Argentine Peso', flag: '🇦🇷' },
  COP: { name: 'Colombian Peso', flag: '🇨🇴' },
  EGP: { name: 'Egyptian Pound', flag: '🇪🇬' },
  VND: { name: 'Vietnamese Dong', flag: '🇻🇳' },
  BDT: { name: 'Bangladeshi Taka', flag: '🇧🇩' },
  PKR: { name: 'Pakistani Rupee', flag: '🇵🇰' },
  NGN: { name: 'Nigerian Naira', flag: '🇳🇬' },
  UAH: { name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  PEN: { name: 'Peruvian Sol', flag: '🇵🇪' },
  RON: { name: 'Romanian Leu', flag: '🇷🇴' },
  BGN: { name: 'Bulgarian Lev', flag: '🇧🇬' },
  HRK: { name: 'Croatian Kuna', flag: '🇭🇷' },
  ISK: { name: 'Icelandic Krona', flag: '🇮🇸' },
  KWD: { name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  QAR: { name: 'Qatari Riyal', flag: '🇶🇦' },
  BHD: { name: 'Bahraini Dinar', flag: '🇧🇭' },
  OMR: { name: 'Omani Rial', flag: '🇴🇲' },
  JOD: { name: 'Jordanian Dinar', flag: '🇯🇴' },
  KES: { name: 'Kenyan Shilling', flag: '🇰🇪' },
  GHS: { name: 'Ghanaian Cedi', flag: '🇬🇭' },
  MAD: { name: 'Moroccan Dirham', flag: '🇲🇦' },
  TND: { name: 'Tunisian Dinar', flag: '🇹🇳' },
  LKR: { name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  MMK: { name: 'Myanmar Kyat', flag: '🇲🇲' },
  BTC: { name: 'Bitcoin', flag: '₿' },
  ETH: { name: 'Ethereum', flag: 'Ξ' },
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      rates: {},
      currencies: [],
      lastUpdated: null,
      baseCurrency: 'USD',
      isLoading: false,
      error: null,

      fetchRates: async (base?: string) => {
        const baseCurr = base || get().baseCurrency;
        set({ isLoading: true, error: null });
        try {
          const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'demo';
          const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${encodeURIComponent(apiKey)}/latest/${encodeURIComponent(baseCurr)}`
          );
          const data = await response.json();
          if (data.result === 'success') {
            const rates = data.conversion_rates as Record<string, number>;
            const currencies: CurrencyRate[] = Object.entries(rates).map(
              ([code, rate]) => ({
                code,
                name: CURRENCY_NAMES[code]?.name || code,
                rate: rate as number,
                flag: CURRENCY_NAMES[code]?.flag,
              })
            );
            set({
              rates,
              currencies,
              lastUpdated: Date.now(),
              baseCurrency: baseCurr,
              isLoading: false,
            });
          } else {
            set({ error: 'Failed to fetch rates', isLoading: false });
          }
        } catch {
          set({ error: 'Network error', isLoading: false });
        }
      },

      getCachedRate: (from, to) => {
        const { rates, baseCurrency } = get();
        if (!rates[from] || !rates[to]) return null;
        if (from === baseCurrency) return rates[to];
        if (to === baseCurrency) return 1 / rates[from];
        return rates[to] / rates[from];
      },

      setBaseCurrency: (code) => set({ baseCurrency: code }),
    }),
    {
      name: 'currency-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        rates: state.rates,
        currencies: state.currencies,
        lastUpdated: state.lastUpdated,
        baseCurrency: state.baseCurrency,
      }),
    }
  )
);
