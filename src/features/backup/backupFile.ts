import { nextOrder } from '../dday/logic/sorting';
import type { LocalDate } from '../dday/logic/dates';
import { type ParseResult, parseStoredData, serializeStoredData } from '../dday/storage/ddaySchema';
import { type Category, type DdayData, MAX_CATEGORIES } from '../dday/types';

const BACKUP_APP_ID = 'naegyeot-dday';
const BACKUP_FORMAT_VERSION = 1;

/** 백업 파일 = 앱 표시 + 저장 형식 그대로의 데이터. 옛 백업도 저장소 마이그레이션으로 읽는다. */
export function createBackupJson(data: DdayData, now: Date): string {
  return JSON.stringify(
    {
      app: BACKUP_APP_ID,
      backupVersion: BACKUP_FORMAT_VERSION,
      exportedAt: now.toISOString(),
      data: JSON.parse(serializeStoredData(data)),
    },
    null,
    2,
  );
}

export function backupFileName(today: LocalDate): string {
  return `naegyeot-dday-backup-${today}.json`;
}

export type BackupParseResult =
  | { ok: true; data: DdayData }
  | { ok: false; reason: 'not-backup' | Extract<ParseResult, { ok: false }>['reason'] };

export function parseBackupJson(raw: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Reflect.get(parsed, 'app') !== BACKUP_APP_ID
  ) {
    return { ok: false, reason: 'not-backup' };
  }
  const result = parseStoredData(JSON.stringify(Reflect.get(parsed, 'data')));
  if (!result.ok) return result;
  return { ok: true, data: { categories: result.categories, items: result.items } };
}

function findSameCategory(
  categories: readonly Category[],
  incoming: Category,
): Category | undefined {
  const name = incoming.name.toLocaleLowerCase();
  return (
    categories.find((category) => category.id === incoming.id) ??
    categories.find((category) => category.name.toLocaleLowerCase() === name)
  );
}

/**
 * 지금 기록을 지우지 않고 백업에서 없는 디데이만 더한다.
 * - 같은 id의 디데이는 이미 있는 것으로 보고 건너뛴다.
 * - 분류는 id나 이름이 같으면 기존 분류를 쓰고, 없으면 추가한다(최대 개수를 넘으면 첫 분류로).
 * - 더한 디데이는 직접 정렬 맨 뒤에 붙는다.
 */
export function mergeBackup(
  current: DdayData,
  incoming: DdayData,
): { next: DdayData; added: number } {
  const categories = [...current.categories];
  const categoryIdMap = new Map<string, string>();
  for (const category of incoming.categories) {
    const same = findSameCategory(categories, category);
    if (same) {
      categoryIdMap.set(category.id, same.id);
    } else if (categories.length < MAX_CATEGORIES) {
      categories.push(category);
      categoryIdMap.set(category.id, category.id);
    }
  }
  const fallbackCategoryId = categories[0]?.id;

  const existingIds = new Set(current.items.map((item) => item.id));
  const items = [...current.items];
  let order = nextOrder(items);
  let added = 0;
  for (const item of incoming.items) {
    if (existingIds.has(item.id)) continue;
    const categoryId = categoryIdMap.get(item.categoryId) ?? fallbackCategoryId;
    if (!categoryId) continue;
    items.push({ ...item, categoryId, order });
    order += 1;
    added += 1;
  }
  return { next: { categories, items }, added };
}
