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

import { refreshWidget } from '../widget/refreshWidget';
import {
  type NotificationSyncResult,
  syncNotifications,
} from './notifications/notificationScheduler';
import { type LoadResult, loadDdays, saveDdays } from './storage/ddayRepository';
import type { Dday, DdayInput } from './types';

type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; reason: string };

type DdayStore = {
  items: Dday[];
  loadState: LoadState;
  notificationSync: NotificationSyncResult | null;
  reload: () => Promise<void>;
  addDday: (input: DdayInput) => Promise<Dday>;
  updateDday: (id: string, input: DdayInput) => Promise<void>;
  removeDday: (id: string) => Promise<void>;
};

const DdayStoreContext = createContext<DdayStore | null>(null);

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function DdayStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Dday[]>([]);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [notificationSync, setNotificationSync] = useState<NotificationSyncResult | null>(null);
  const itemsRef = useRef<Dday[]>([]);
  const canWriteRef = useRef(false);
  // 저장을 한 줄로 세워서 빠른 연속 탭에도 이전 저장 결과를 덮어쓰지 않게 한다.
  const writeQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const applySideEffects = useCallback(async (next: readonly Dday[]) => {
    try {
      setNotificationSync(await syncNotifications(next));
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
      itemsRef.current = result.items;
      setItems(result.items);
      canWriteRef.current = true;
      setLoadState({ status: 'ready' });
      void applySideEffects(result.items);
    },
    [applySideEffects],
  );

  // 첫 렌더는 이미 loading 상태이므로 여기서는 결과가 나온 뒤에만 상태를 바꾼다.
  const loadFromStorage = useCallback(
    () =>
      loadDdays()
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
    <T,>(change: (current: Dday[]) => { next: Dday[]; result: T }): Promise<T> => {
      const task = writeQueueRef.current.then(async () => {
        // 손상된 데이터를 읽은 상태에서 저장하면 원본이 사라지므로 막는다.
        if (!canWriteRef.current) throw new Error('데이터를 불러오지 못해 저장할 수 없어요.');
        const { next, result } = change(itemsRef.current);
        await saveDdays(next);
        itemsRef.current = next;
        setItems(next);
        void applySideEffects(next);
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
        const now = new Date().toISOString();
        const created: Dday = { ...input, id: createId(), createdAt: now, updatedAt: now };
        return { next: [...current, created], result: created };
      }),
    [mutate],
  );

  const updateDday = useCallback(
    (id: string, input: DdayInput) =>
      mutate((current) => {
        if (!current.some((item) => item.id === id)) throw new Error('디데이를 찾을 수 없어요.');
        const now = new Date().toISOString();
        return {
          next: current.map((item) =>
            item.id === id ? { ...item, ...input, updatedAt: now } : item,
          ),
          result: undefined,
        };
      }),
    [mutate],
  );

  const removeDday = useCallback(
    (id: string) =>
      mutate((current) => ({ next: current.filter((item) => item.id !== id), result: undefined })),
    [mutate],
  );

  const value = useMemo<DdayStore>(
    () => ({ items, loadState, notificationSync, reload, addDday, updateDday, removeDday }),
    [items, loadState, notificationSync, reload, addDday, updateDday, removeDday],
  );

  return <DdayStoreContext.Provider value={value}>{children}</DdayStoreContext.Provider>;
}

export function useDdayStore(): DdayStore {
  const store = useContext(DdayStoreContext);
  if (!store) throw new Error('DdayStoreProvider 안에서 사용해야 해요.');
  return store;
}
