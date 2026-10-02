import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { CategoryColorKey } from '../../theme/tokens';
import { refreshWidget } from '../widget/refreshWidget';
import {
  addCategory as addCategoryTo,
  removeCategory as removeCategoryFrom,
} from './logic/categories';
import { applyManualOrder, nextOrder } from './logic/sorting';
import {
  type NotificationSyncResult,
  syncNotifications,
} from './notifications/notificationScheduler';
import { type LoadResult, loadDdayData, saveDdayData } from './storage/ddayRepository';
import type { Category, Dday, DdayData, DdayInput } from './types';

type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; reason: string };

type DdayStore = {
  items: Dday[];
  categories: Category[];
  loadState: LoadState;
  notificationSync: NotificationSyncResult | null;
  reload: () => Promise<void>;
  addDday: (input: DdayInput) => Promise<Dday>;
  updateDday: (id: string, input: DdayInput) => Promise<void>;
  removeDday: (id: string) => Promise<void>;
  reorderDdays: (orderedIds: readonly string[]) => Promise<void>;
  addCategory: (name: string, color: CategoryColorKey) => Promise<Category>;
  removeCategory: (id: string) => Promise<void>;
};

const EMPTY_DATA: DdayData = { categories: [], items: [] };

const DdayStoreContext = createContext<DdayStore | null>(null);

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function DdayStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DdayData>(EMPTY_DATA);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [notificationSync, setNotificationSync] = useState<NotificationSyncResult | null>(null);
  const dataRef = useRef<DdayData>(EMPTY_DATA);
  const canWriteRef = useRef(false);
  // 저장을 한 줄로 세워서 빠른 연속 탭에도 이전 저장 결과를 덮어쓰지 않게 한다.
  const writeQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const applySideEffects = useCallback(async (items: readonly Dday[]) => {
    try {
      setNotificationSync(await syncNotifications(items));
    } catch (error) {
      // 알림 예약 실패가 기록 저장을 되돌리면 안 되므로 경고만 남긴다.
      console.warn('알림 예약 실패', error);
    }
    try {
      await refreshWidget();
    } catch (error) {
      console.warn('위젯 갱신 실패', error);
    }
  }, []);

  const applyLoadResult = useCallback(
    (result: LoadResult) => {
      if (!result.ok) {
        setLoadState({ status: 'error', reason: result.reason });
        return;
      }
      const loaded: DdayData = { categories: result.categories, items: result.items };
      dataRef.current = loaded;
      setData(loaded);
      canWriteRef.current = true;
      setLoadState({ status: 'ready' });
      void applySideEffects(loaded.items);
    },
    [applySideEffects],
  );

  // 첫 렌더는 이미 loading 상태이므로 여기서는 결과가 나온 뒤에만 상태를 바꾼다.
  const loadFromStorage = useCallback(
    () =>
      loadDdayData()
        .then(applyLoadResult)
        .catch((error: unknown) => {
          setLoadState({
            status: 'error',
            reason: error instanceof Error ? error.message : 'unknown',
          });
        }),
    [applyLoadResult],
  );

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  const reload = useCallback(async () => {
    canWriteRef.current = false;
    setLoadState({ status: 'loading' });
    await loadFromStorage();
  }, [loadFromStorage]);

  const mutate = useCallback(
    <T,>(change: (current: DdayData) => { next: DdayData; result: T }): Promise<T> => {
      const task = writeQueueRef.current.then(async () => {
        // 손상된 데이터를 읽은 상태에서 저장하면 원본이 사라지므로 막는다.
        if (!canWriteRef.current) throw new Error('데이터를 불러오지 못해 저장할 수 없어요.');
        const { next, result } = change(dataRef.current);
        await saveDdayData(next);
        dataRef.current = next;
        setData(next);
        void applySideEffects(next.items);
        return result;
      });
      writeQueueRef.current = task.catch(() => undefined);
      return task;
    },
    [applySideEffects],
  );

  const addDday = useCallback(
    (input: DdayInput) =>
      mutate((current) => {
        if (!current.categories.some((category) => category.id === input.categoryId)) {
          throw new Error('분류를 찾을 수 없어요.');
        }
        const now = new Date().toISOString();
        const created: Dday = {
          ...input,
          id: createId(),
          order: nextOrder(current.items),
          createdAt: now,
          updatedAt: now,
        };
        return { next: { ...current, items: [...current.items, created] }, result: created };
      }),
    [mutate],
  );

  const updateDday = useCallback(
    (id: string, input: DdayInput) =>
      mutate((current) => {
        if (!current.items.some((item) => item.id === id)) {
          throw new Error('디데이를 찾을 수 없어요.');
        }
        if (!current.categories.some((category) => category.id === input.categoryId)) {
          throw new Error('분류를 찾을 수 없어요.');
        }
        const now = new Date().toISOString();
        return {
          next: {
            ...current,
            items: current.items.map((item) =>
              item.id === id ? { ...item, ...input, updatedAt: now } : item,
            ),
          },
          result: undefined,
        };
      }),
    [mutate],
  );

  const removeDday = useCallback(
    (id: string) =>
      mutate((current) => ({
        next: { ...current, items: current.items.filter((item) => item.id !== id) },
        result: undefined,
      })),
    [mutate],
  );

  const reorderDdays = useCallback(
    (orderedIds: readonly string[]) =>
      mutate((current) => ({
        next: { ...current, items: applyManualOrder(current.items, orderedIds) },
        result: undefined,
      })),
    [mutate],
  );

  const addCategory = useCallback(
    (name: string, color: CategoryColorKey) =>
      mutate((current) => {
        const next = addCategoryTo(current, {
          id: createId(),
          name,
          color,
          now: new Date().toISOString(),
        });
        const created = next.categories.at(-1);
        if (!created) throw new Error('분류를 추가하지 못했어요.');
        return { next, result: created };
      }),
    [mutate],
  );

  const removeCategory = useCallback(
    (id: string) =>
      mutate((current) => ({
        next: removeCategoryFrom(current, id, new Date().toISOString()),
        result: undefined,
      })),
    [mutate],
  );

  const value = useMemo<DdayStore>(
    () => ({
      items: data.items,
      categories: data.categories,
      loadState,
      notificationSync,
      reload,
      addDday,
      updateDday,
      removeDday,
      reorderDdays,
      addCategory,
      removeCategory,
    }),
    [
      data,
      loadState,
      notificationSync,
      reload,
      addDday,
      updateDday,
      removeDday,
      reorderDdays,
      addCategory,
      removeCategory,
    ],
  );

  return <DdayStoreContext.Provider value={value}>{children}</DdayStoreContext.Provider>;
}

export function useDdayStore(): DdayStore {
  const store = useContext(DdayStoreContext);
  if (!store) throw new Error('DdayStoreProvider 안에서 사용해야 해요.');
  return store;
}
