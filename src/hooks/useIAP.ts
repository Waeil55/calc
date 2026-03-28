/**
 * useIAP — In-App Purchase hook for CalcPro Enterprise Pro upgrade.
 * Wraps react-native-iap with graceful fallback when the library is absent
 * (e.g. during development on a device that has no billing service).
 */
import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

export const IAP_PRODUCT_IDS = {
  PRO_MONTHLY: 'com.calcproenterprise.pro.monthly',
  PRO_YEARLY: 'com.calcproenterprise.pro.yearly',
  PRO_LIFETIME: 'com.calcproenterprise.pro.lifetime',
} as const;

export type IAPProductId = (typeof IAP_PRODUCT_IDS)[keyof typeof IAP_PRODUCT_IDS];

export interface IAPProduct {
  productId: IAPProductId;
  title: string;
  description: string;
  price: string;
  currency: string;
}

export interface UseIAP {
  isPro: boolean;
  isLoading: boolean;
  products: IAPProduct[];
  purchasePro: (productId: IAPProductId) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  error: string | null;
}

// Stub products shown while real IAP is loading or unavailable
const STUB_PRODUCTS: IAPProduct[] = [
  { productId: IAP_PRODUCT_IDS.PRO_MONTHLY, title: 'CalcPro Pro Monthly', description: 'Unlimited access', price: '$2.99', currency: 'USD' },
  { productId: IAP_PRODUCT_IDS.PRO_YEARLY, title: 'CalcPro Pro Yearly', description: 'Best value, save 50%', price: '$14.99', currency: 'USD' },
  { productId: IAP_PRODUCT_IDS.PRO_LIFETIME, title: 'CalcPro Pro Lifetime', description: 'One-time purchase', price: '$29.99', currency: 'USD' },
];

let iap: typeof import('react-native-iap') | null = null;

async function tryLoadIAP() {
  if (iap) return iap;
  try {
    iap = await import('react-native-iap');
  } catch {
    iap = null;
  }
  return iap;
}

export function useIAP(): UseIAP {
  const { isPro, setIsPro } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<IAPProduct[]>(STUB_PRODUCTS);
  const [error, setError] = useState<string | null>(null);

  // Initialise connection and fetch products on mount
  useEffect(() => {
    if (isPro) return; // Already unlocked, skip IAP setup
    let unmounted = false;

    (async () => {
      const lib = await tryLoadIAP();
      if (!lib || unmounted) return;

      try {
        await lib.initConnection();
        const raw = await lib.fetchProducts(
          { skus: Object.values(IAP_PRODUCT_IDS) },
        );

        if (unmounted) return;

        const items = (raw ?? []) as unknown as Record<string, unknown>[];
        const mapped: IAPProduct[] = items.map((p) => ({
          productId: (p['productId'] ?? p['id']) as IAPProductId,
          title: (p['title'] ?? p['productId'] ?? '') as string,
          description: (p['description'] ?? '') as string,
          price: (p['localizedPrice'] ?? p['price'] ?? '') as string,
          currency: (p['currency'] ?? '') as string,
        }));

        if (mapped.length > 0) setProducts(mapped);
      } catch {
        // Keep stub products; IAP not available on this device/simulator
      }
    })();

    return () => {
      unmounted = true;
      tryLoadIAP().then((lib) => {
        lib?.endConnection().catch(() => null);
      });
    };
  }, [isPro]);

  const purchasePro = useCallback(
    async (productId: IAPProductId): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      const lib = await tryLoadIAP();

      if (!lib) {
        // Fallback for development / simulators
        if (__DEV__) {
          setIsPro(true);
          setIsLoading(false);
          return true;
        }
        setError('In-app purchases are not available on this device.');
        setIsLoading(false);
        return false;
      }

      try {
        await lib.requestPurchase({
          request: { apple: { sku: productId }, ios: { sku: productId }, android: { skus: [productId] }, google: { skus: [productId] } },
          type: 'in-app',
        });

        // Purchase flow succeeded — listen to purchaseUpdatedListener
        // We unlock Pro here optimistically; the purchaseUpdatedListener
        // (set up in App.tsx if needed) can also call setIsPro.
        setIsPro(true);
        setIsLoading(false);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Purchase failed.';
        if (!message.includes('cancel')) {
          setError(message);
          Alert.alert('Purchase Failed', message);
        }
        setIsLoading(false);
        return false;
      }
    },
    [setIsPro]
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const lib = await tryLoadIAP();

    if (!lib) {
      setError('In-app purchases are not available on this device.');
      setIsLoading(false);
      return false;
    }

    try {
      const purchases = await lib.getAvailablePurchases();
      const proProductIds = new Set(Object.values(IAP_PRODUCT_IDS) as string[]);
      const hasPro = purchases.some((p) => proProductIds.has(p.productId));

      if (hasPro) {
        setIsPro(true);
        Alert.alert('Restored', 'Your Pro subscription has been restored.');
      } else {
        Alert.alert('Nothing to Restore', 'No previous Pro purchase found for this account.');
      }

      setIsLoading(false);
      return hasPro;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Restore failed.';
      setError(message);
      Alert.alert('Restore Failed', message);
      setIsLoading(false);
      return false;
    }
  }, [setIsPro]);

  return { isPro, isLoading, products, purchasePro, restorePurchases, error };
}

/** Higher-order helper: returns true if the feature requires Pro and user is not Pro */
export function requiresPro(featureLabel: string, isPro: boolean): boolean {
  if (isPro) return false;
  Alert.alert(
    'Pro Feature',
    `${featureLabel} is available in CalcPro Pro. Upgrade to unlock all features.`
  );
  return true;
}
