import { isValidLocalDate } from '../logic/dates';
import {
  DDAY_CATEGORIES,
  type Dday,
  type DdayCategory,
  DEFAULT_CATEGORY,
  MAX_TITLE_LENGTH,
  NOTIFY_DAYS_BEFORE_OPTIONS,
  type NotifyDaysBefore,
} from '../types';

/**
 * 저장 형식 버전.
 * - 1: 최초 버전
 * - 2: category 추가. 1의 항목은 개인(DEFAULT_CATEGORY)으로 옮긴다.
 */
export const CURRENT_SCHEMA_VERSION = 2;

type StoredData = { version: typeof CURRENT_SCHEMA_VERSION; items: Dday[] };

export type ParseResult =
  | { ok: true; items: Dday[] }
  | { ok: false; reason: 'invalid-json' | 'invalid-data' | 'unsupported-version' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNotifyDaysBefore(value: unknown): value is NotifyDaysBefore {
  return NOTIFY_DAYS_BEFORE_OPTIONS.some((option) => option === value);
}

function isCategory(value: unknown): value is DdayCategory {
  return DDAY_CATEGORIES.some((category) => category === value);
}

export function isDday(value: unknown): value is Dday {
  if (!isRecord(value)) return false;
  const {
    id,
    title,
    category,
    date,
    repeatYearly,
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
    isCategory(category) &&
    typeof date === 'string' &&
    isValidLocalDate(date) &&
    typeof repeatYearly === 'boolean' &&
    typeof notifyOnDay === 'boolean' &&
    (notifyDaysBefore === null || isNotifyDaysBefore(notifyDaysBefore)) &&
    typeof createdAt === 'string' &&
    typeof updatedAt === 'string'
  );
}

/** 버전별로 한 단계씩 올린다. 알 수 없는 형식이면 null. */
function migrateItems(version: number, items: unknown[]): unknown[] | null {
  if (version === 1) {
    return items.map((item) => (isRecord(item) ? { ...item, category: DEFAULT_CATEGORY } : item));
  }
  if (version === CURRENT_SCHEMA_VERSION) return items;
  return null;
}

/**
 * 저장된 문자열을 검증한다. 손상되었거나 알 수 없는 버전이면 실패를 돌려주고,
 * 호출하는 쪽은 원본을 덮어쓰지 않아야 한다.
 */
export function parseStoredData(raw: string | null): ParseResult {
  if (raw === null) return { ok: true, items: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  if (!isRecord(parsed) || typeof parsed.version !== 'number' || !Array.isArray(parsed.items)) {
    return { ok: false, reason: 'invalid-data' };
  }
  // 새 버전 앱에서 저장한 데이터를 구버전이 덮어쓰지 않도록 막는다.
  if (parsed.version > CURRENT_SCHEMA_VERSION) return { ok: false, reason: 'unsupported-version' };

  const items = migrateItems(parsed.version, parsed.items);
  if (!items || !items.every(isDday)) return { ok: false, reason: 'invalid-data' };
  return { ok: true, items };
}

export function serializeStoredData(items: readonly Dday[]): string {
  const data: StoredData = { version: CURRENT_SCHEMA_VERSION, items: [...items] };
  return JSON.stringify(data);
}
