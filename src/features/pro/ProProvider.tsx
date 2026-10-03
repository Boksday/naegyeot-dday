import {
  endConnection,
  ErrorCode,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  type Purchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'expo-iap';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { IS_PRO_FREE } from '../../config/appVariant';
import { refreshWidget } from '../widget/refreshWidget';
import { loadCachedPro, saveCachedPro } from './proCache';

/** Play Console에 등록할 일회성(관리형) 상품 ID. docs/pro.md */
export const PRO_PRODUCT_ID = 'naegyeot_dday_pro';

type StoreStatus = 'connecting' | 'ready' | 'unavailable';

type ProState = {
  isPro: boolean;
  storeStatus: StoreStatus;
  /** 스토어가 알려준 현지 가격 표시. 예: ₩3,300 */
  displayPrice: string | null;
  isPurchasing: boolean;
  purchaseError: string | null;
  buy: () => Promise<void>;
  restore: () => Promise<boolean>;
};

const ProContext = createContext<ProState | null>(null);

function isProPurchase(purchase: Purchase): boolean {
  return purchase.productId === PRO_PRODUCT_ID && purchase.purchaseState === 'purchased';
}

export function ProProvider({ children }: { children: ReactNode }) {
  // 개발용 앱·내부 테스트용 빌드는 결제 없이 Pro 기능을 확인할 수 있게 켜 둔다.
  const [isPro, setIsPro] = useState(IS_PRO_FREE);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>('connecting');
  const [displayPrice, setDisplayPrice] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const applyPro = useCallback((next: boolean) => {
    setIsPro(next);
    saveCachedPro(next)
      // 홈 위젯은 Pro 전용이라 상태가 바뀌면 다시 그린다.
      .then(() => refreshWidget())
      .catch((error: unknown) => {
        console.warn('Pro 상태 저장 실패', error);
      });
  }, []);

  /** 완료 처리(acknowledge)를 하지 않으면 Google이 3일 뒤 자동 환불한다. */
  const settle = useCallback(async (purchase: Purchase) => {
    await finishTransaction({ purchase, isConsumable: false });
  }, []);

  const syncPurchases = useCallback(async (): Promise<boolean> => {
    const purchases = await getAvailablePurchases();
    const owned = purchases.filter(isProPurchase);
    await Promise.all(owned.map(settle));
    // 환불되면 목록에서 빠지므로 스토어 결과를 그대로 따른다.
    applyPro(owned.length > 0);
    return owned.length > 0;
  }, [applyPro, settle]);

  useEffect(() => {
    if (IS_PRO_FREE) {
      // 위젯이 저장값보다 먼저 그려졌을 수 있어 저장 뒤 다시 그린다.
      saveCachedPro(true)
        .then(() => refreshWidget())
        .catch(() => undefined);
      return;
    }
    let isActive = true;
    loadCachedPro()
      .then((cached) => {
        if (isActive && cached) setIsPro(true);
      })
      .catch(() => undefined);

    const updated = purchaseUpdatedListener((purchase) => {
      if (!isProPurchase(purchase)) return;
      settle(purchase)
        .then(() => {
          applyPro(true);
          setPurchaseError(null);
        })
        .catch((error: unknown) => {
          setPurchaseError(error instanceof Error ? error.message : String(error));
        })
        .finally(() => setIsPurchasing(false));
    });
    const failed = purchaseErrorListener((error) => {
      setIsPurchasing(false);
      if (error.code !== ErrorCode.UserCancelled) setPurchaseError(error.message);
    });

    initConnection()
      .then(async () => {
        const products = await fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' });
        const found = products?.find((item) => item.id === PRO_PRODUCT_ID) ?? null;
        if (!isActive) return;
        setDisplayPrice(found?.displayPrice ?? null);
        setStoreStatus(found ? 'ready' : 'unavailable');
        await syncPurchases();
      })
      .catch((error: unknown) => {
        // 스토어에 상품이 아직 없거나 Play 스토어를 쓸 수 없는 기기. 기기 저장 값을 그대로 쓴다.
        console.warn('스토어 연결 실패', error);
        if (isActive) setStoreStatus('unavailable');
      });

    return () => {
      isActive = false;
      updated.remove();
      failed.remove();
      endConnection().catch(() => undefined);
    };
  }, [applyPro, settle, syncPurchases]);

  const buy = useCallback(async () => {
    setPurchaseError(null);
    setIsPurchasing(true);
    try {
      await requestPurchase({
        request: { apple: { sku: PRO_PRODUCT_ID }, google: { skus: [PRO_PRODUCT_ID] } },
        type: 'in-app',
      });
    } catch (error) {
      setIsPurchasing(false);
      setPurchaseError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  const value = useMemo<ProState>(
    () => ({
      isPro,
      storeStatus,
      displayPrice,
      isPurchasing,
      purchaseError,
      buy,
      restore: syncPurchases,
    }),
    [isPro, storeStatus, displayPrice, isPurchasing, purchaseError, buy, syncPurchases],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): ProState {
  const state = useContext(ProContext);
  if (!state) throw new Error('ProProvider 안에서 사용해야 해요.');
  return state;
}
