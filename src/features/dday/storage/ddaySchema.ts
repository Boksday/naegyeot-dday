import { isValidLocalDate } from '../logic/dates';
import {
  type Dday,
  MAX_TITLE_LENGTH,
  NOTIFY_DAYS_BEFORE_OPTIONS,
  type NotifyDaysBefore,
} from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

type StoredDataV1 = { version: 1; items: Dday[] };

export type ParseResult =
  | { ok: true; items: Dday[] }
  | { ok: false; reason: 'invalid-json' | 'invalid-data' | 'unsupported-version' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNotifyDaysBefore(value: unknown): value is NotifyDaysBefore {
  return NOTIFY_DAYS_BEFORE_OPTIONS.some((option) => option === value);
}

export function isDday(value: unknown): value is Dday {
  if (!isRecord(value)) return false;
  const { id, title, date, repeatYearly, notifyOnDay, notifyDaysBefore, createdAt, updatedAt } =
    value;
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof title === 'string' &&
    title.trim().length > 0 &&
    title.length <= MAX_TITLE_LENGTH &&
    typeof date === 'string' &&
    isValidLocalDate(date) &&
    typeof repeatYearly === 'boolean' &&
    typeof notifyOnDay === 'boolean' &&
    (notifyDaysBefore === null || isNotifyDaysBefore(notifyDaysBefore)) &&
    typeof createdAt === 'string' &&
    typeof updatedAt === 'string'
  );
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

  if (!isRecord(parsed) || typeof parsed.version !== 'number') {
    return { ok: false, reason: 'invalid-data' };
  }
  // 새 버전 앱에서 저장한 데이터를 구버전이 덮어쓰지 않도록 막는다.
  if (parsed.version > CURRENT_SCHEMA_VERSION) return { ok: false, reason: 'unsupported-version' };
  if (parsed.version !== 1) return { ok: false, reason: 'invalid-data' };

  const { items } = parsed;
  if (!Array.isArray(items) || !items.every(isDday)) return { ok: false, reason: 'invalid-data' };
  return { ok: true, items };
}

export function serializeStoredData(items: readonly Dday[]): string {
  const data: StoredDataV1 = { version: CURRENT_SCHEMA_VERSION, items: [...items] };
  return JSON.stringify(data);
}
