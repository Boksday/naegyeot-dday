import type { CategoryColorKey } from '../../../theme/tokens';
import { type Category, type DdayData, MAX_CATEGORIES, MAX_CATEGORY_NAME_LENGTH } from '../types';

export type CategoryNameError = 'empty' | 'too-long' | 'duplicate';

export function validateCategoryName(
  name: string,
  categories: readonly Category[],
): CategoryNameError | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'empty';
  if (trimmed.length > MAX_CATEGORY_NAME_LENGTH) return 'too-long';
  const normalized = trimmed.toLocaleLowerCase();
  if (categories.some((category) => category.name.toLocaleLowerCase() === normalized)) {
    return 'duplicate';
  }
  return null;
}

export function canAddCategory(categories: readonly Category[]): boolean {
  return categories.length < MAX_CATEGORIES;
}

export function addCategory(
  data: DdayData,
  input: { id: string; name: string; color: CategoryColorKey; now: string },
): DdayData {
  if (!canAddCategory(data.categories)) throw new Error('분류를 더 추가할 수 없어요.');
  const error = validateCategoryName(input.name, data.categories);
  if (error) throw new Error(`분류 이름이 올바르지 않아요: ${error}`);
  const created: Category = {
    id: input.id,
    name: input.name.trim(),
    color: input.color,
    createdAt: input.now,
  };
  return { ...data, categories: [...data.categories, created] };
}

/** 삭제할 분류의 디데이를 옮길 분류. 남는 분류 중 첫 번째다. */
export function getFallbackCategory(
  categories: readonly Category[],
  removingId: string,
): Category | null {
  return categories.find((category) => category.id !== removingId) ?? null;
}

/**
 * 분류를 지우고 그 분류의 디데이는 남은 첫 분류로 옮긴다. 디데이 자체는 지우지 않는다.
 * 분류가 하나만 남았으면 지울 수 없다.
 */
export function removeCategory(data: DdayData, id: string, now: string): DdayData {
  if (!data.categories.some((category) => category.id === id)) {
    throw new Error('분류를 찾을 수 없어요.');
  }
  const fallback = getFallbackCategory(data.categories, id);
  if (!fallback) throw new Error('분류는 하나 이상 있어야 해요.');
  return {
    categories: data.categories.filter((category) => category.id !== id),
    items: data.items.map((item) =>
      item.categoryId === id ? { ...item, categoryId: fallback.id, updatedAt: now } : item,
    ),
  };
}

export function countItemsInCategory(data: DdayData, id: string): number {
  return data.items.filter((item) => item.categoryId === id).length;
}

export function findCategory(categories: readonly Category[], id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
