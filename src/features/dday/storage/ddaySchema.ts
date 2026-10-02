import { isValidLocalDate } from '../logic/dates';
import { CATEGORY_COLOR_KEYS, type CategoryColorKey } from '../../../theme/tokens';
import {
  type Category,
  type Dday,
  type DdayData,
  DEFAULT_CATEGORIES,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_TITLE_LENGTH,
  NOTIFY_DAYS_BEFORE_OPTIONS,
  type NotifyDaysBefore,
} from '../types';

/**
 * 저장 형식 버전.
 * - 1: 최초 버전
 * - 2: 항목에 고정 분류(category) 추가. 1의 항목은 개인으로 옮긴다.
 * - 3: 분류를 사용자가 관리. categories 목록 추가, 항목은 categoryId로 참조한다.
 * - 4: 100일 단위 기념일을 디데이별 선택(showMilestones)으로. 이전 항목은 늘 보였으므로 true.
 * - 5: 직접 정렬 순서(order). 이전 항목은 추가한 순서대로 매긴다.
 */
export const CURRENT_SCHEMA_VERSION = 5;

/** 버전 1 기록을 옮길 분류. 버전 2의 기본값과 같다. */
const V1_DEFAULT_CATEGORY_ID = 'personal';

type StoredData = { version: typeof CURRENT_SCHEMA_VERSION } & DdayData;

export type ParseResult =
  | ({ ok: true } & DdayData)
  | { ok: false; reason: 'invalid-json' | 'invalid-data' | 'unsupported-version' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNotifyDaysBefore(value: unknown): value is NotifyDaysBefore {
  return NOTIFY_DAYS_BEFORE_OPTIONS.some((option) => option === value);
}

function isColorKey(value: unknown): value is CategoryColorKey {
  return CATEGORY_COLOR_KEYS.some((key) => key === value);
}

export function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  const { id, name, color, createdAt } = value;
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof name === 'string' &&
    name.trim().length > 0 &&
    name.length <= MAX_CATEGORY_NAME_LENGTH &&
    isColorKey(color) &&
    typeof createdAt === 'string'
  );
}

export function isDday(value: unknown): value is Dday {
  if (!isRecord(value)) return false;
  const {
    id,
    title,
    categoryId,
    date,
    repeatYearly,
    showMilestones,
    order,
    notifyOnDay,
    notifyDaysBefore,
    createdAt,
    updatedAt,
  } = value;
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof title === 'string' &&
    title.trim().length > 0 &&
    title.length <= MAX_TITLE_LENGTH &&
    typeof categoryId === 'string' &&
    typeof date === 'string' &&
    isValidLocalDate(date) &&
    typeof repeatYearly === 'boolean' &&
    typeof showMilestones === 'boolean' &&
    typeof order === 'number' &&
    Number.isFinite(order) &&
    typeof notifyOnDay === 'boolean' &&
    (notifyDaysBefore === null || isNotifyDaysBefore(notifyDaysBefore)) &&
    typeof createdAt === 'string' &&
    typeof updatedAt === 'string'
  );
}

function renameKey(item: unknown, from: string, to: string): unknown {
  if (!isRecord(item) || !(from in item)) return item;
  const { [from]: value, ...rest } = item;
  return { ...rest, [to]: value };
}

/** 한 버전씩 올려 최신 형식의 { categories, items } 후보를 만든다. 알 수 없는 형식이면 null. */
function migrate(data: Record<string, unknown>): { categories: unknown; items: unknown } | null {
  let version = data.version;
  let items = data.items;
  let categories = data.categories;

  if (version === 1) {
    if (!Array.isArray(items)) return null;
    items = items.map((item) =>
      isRecord(item) ? { ...item, category: V1_DEFAULT_CATEGORY_ID } : item,
    );
    version = 2;
  }
  if (version === 2) {
    if (!Array.isArray(items)) return null;
    // 버전 2의 고정 분류 id(couple/personal/work)는 기본 분류 id와 같다.
    items = items.map((item) => renameKey(item, 'category', 'categoryId'));
    categories = [...DEFAULT_CATEGORIES];
    version = 3;
  }
  if (version === 3) {
    if (!Array.isArray(items)) return null;
    items = items.map((item) => (isRecord(item) ? { ...item, showMilestones: true } : item));
    version = 4;
  }
  if (version === 4) {
    if (!Array.isArray(items)) return null;
    items = items.map((item, index) => (isRecord(item) ? { ...item, order: index } : item));
    version = 5;
  }
  if (version !== CURRENT_SCHEMA_VERSION) return null;
  return { categories, items };
}

function hasUniqueIds(values: readonly { id: string }[]): boolean {
  return new Set(values.map((value) => value.id)).size === values.length;
}

/**
 * 저장된 문자열을 검증한다. 손상되었거나 알 수 없는 버전이면 실패를 돌려주고,
 * 호출하는 쪽은 원본을 덮어쓰지 않아야 한다.
 */
export function parseStoredData(raw: string | null): ParseResult {
  if (raw === null) return { ok: true, categories: [...DEFAULT_CATEGORIES], items: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  if (!isRecord(parsed) || typeof parsed.version !== 'number') {
    return { ok: false, reason: 'invalid-data' };
  }
  // 새 버전 앱에서 저장한 데이터를 구버전이 덮어쓰지 않도록 막는다.
  if (parsed.version > CURRENT_SCHEMA_VERSION) return { ok: false, reason: 'unsupported-version' };

  const migrated = migrate(parsed);
  if (!migrated) return { ok: false, reason: 'invalid-data' };
  const { categories, items } = migrated;
  if (
    !Array.isArray(categories) ||
    categories.length === 0 ||
    !categories.every(isCategory) ||
    !hasUniqueIds(categories) ||
    !Array.isArray(items) ||
    !items.every(isDday) ||
    !hasUniqueIds(items)
  ) {
    return { ok: false, reason: 'invalid-data' };
  }
  const categoryIds = new Set(categories.map((category) => category.id));
  if (!items.every((item) => categoryIds.has(item.categoryId))) {
    return { ok: false, reason: 'invalid-data' };
  }
  return { ok: true, categories, items };
}

export function serializeStoredData(data: DdayData): string {
  const stored: StoredData = {
    version: CURRENT_SCHEMA_VERSION,
    categories: [...data.categories],
    items: [...data.items],
  };
  return JSON.stringify(stored);
}
