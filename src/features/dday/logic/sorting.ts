import type { Dday } from '../types';
import type { LocalDate } from './dates';
import { sortForDisplay } from './ddayStatus';

export const SORT_MODES = ['upcoming', 'manual', 'recent', 'title'] as const;
export type SortMode = (typeof SORT_MODES)[number];
export const DEFAULT_SORT_MODE: SortMode = 'upcoming';

export function isSortMode(value: unknown): value is SortMode {
  return SORT_MODES.some((mode) => mode === value);
}

const titleCollator = new Intl.Collator('ko');

export function sortDdays<T extends Dday>(
  items: readonly T[],
  mode: SortMode,
  today: LocalDate,
): T[] {
  switch (mode) {
    case 'upcoming':
      return sortForDisplay(items, today);
    case 'manual':
      return [...items].sort((a, b) => a.order - b.order);
    case 'recent':
      return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'title':
      return [...items].sort((a, b) => titleCollator.compare(a.title, b.title));
  }
}

/** 새 디데이는 직접 정렬의 맨 뒤에 둔다. */
export function nextOrder(items: readonly Dday[]): number {
  return items.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}

/**
 * orderedIds 순서대로 직접 정렬 순서를 다시 매긴다.
 * 분류로 걸러 본 일부만 옮긴 경우에도 다른 디데이와의 상대 위치가 유지되도록,
 * 옮긴 디데이들이 쓰던 순서 값만 새 순서로 나눠 준다.
 */
export function applyManualOrder(items: readonly Dday[], orderedIds: readonly string[]): Dday[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const moved = orderedIds.map((id) => byId.get(id)).filter((item) => item !== undefined);
  if (moved.length !== orderedIds.length) throw new Error('디데이를 찾을 수 없어요.');
  const slots = moved.map((item) => item.order).sort((a, b) => a - b);
  const nextOrderById = new Map(orderedIds.map((id, index) => [id, slots[index]]));
  return items.map((item) => {
    const order = nextOrderById.get(item.id);
    return order === undefined || order === item.order ? item : { ...item, order };
  });
}
