import { type Category, type Dday, DEFAULT_CATEGORIES } from '../types';
import { parseStoredData, serializeStoredData } from './ddaySchema';

const CATEGORY: Category = {
  id: 'family',
  name: '가족',
  color: 'green',
  createdAt: '2026-10-02T00:00:00.000Z',
};

const ITEM: Dday = {
  id: 'a',
  title: '우리 만난 날',
  categoryId: 'family',
  date: '2025-03-01',
  repeatYearly: true,
  notifyOnDay: true,
  notifyDaysBefore: 3,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

function v3(data: { categories?: unknown[]; items?: unknown[] }) {
  return JSON.stringify({ version: 3, categories: [CATEGORY], items: [ITEM], ...data });
}

describe('parseStoredData', () => {
  it('저장 기록이 없으면 기본 분류와 빈 목록이다', () => {
    expect(parseStoredData(null)).toEqual({
      ok: true,
      categories: DEFAULT_CATEGORIES,
      items: [],
    });
  });

  it('저장한 데이터를 그대로 읽는다', () => {
    const raw = serializeStoredData({ categories: [CATEGORY], items: [ITEM] });
    expect(parseStoredData(raw)).toEqual({ ok: true, categories: [CATEGORY], items: [ITEM] });
  });

  it('JSON이 깨졌으면 실패한다', () => {
    expect(parseStoredData('{not json')).toEqual({ ok: false, reason: 'invalid-json' });
  });

  it('항목 하나라도 형식이 틀리면 실패한다', () => {
    const raw = v3({ items: [ITEM, { ...ITEM, id: 'b', date: '2025-02-30' }] });
    expect(parseStoredData(raw)).toEqual({ ok: false, reason: 'invalid-data' });
  });

  it('허용하지 않은 미리 알림 일수는 실패한다', () => {
    expect(parseStoredData(v3({ items: [{ ...ITEM, notifyDaysBefore: 5 }] }))).toEqual({
      ok: false,
      reason: 'invalid-data',
    });
  });

  it('없는 분류를 가리키는 항목이 있으면 실패한다', () => {
    expect(parseStoredData(v3({ items: [{ ...ITEM, categoryId: 'ghost' }] }))).toEqual({
      ok: false,
      reason: 'invalid-data',
    });
  });

  it('분류가 하나도 없으면 실패한다', () => {
    expect(parseStoredData(v3({ categories: [], items: [] }))).toEqual({
      ok: false,
      reason: 'invalid-data',
    });
  });

  it('id가 겹치면 실패한다', () => {
    expect(parseStoredData(v3({ items: [ITEM, ITEM] }))).toEqual({
      ok: false,
      reason: 'invalid-data',
    });
  });

  it('더 새로운 버전의 데이터는 덮어쓰지 않도록 실패한다', () => {
    const raw = JSON.stringify({ version: 4, categories: [], items: [] });
    expect(parseStoredData(raw)).toEqual({ ok: false, reason: 'unsupported-version' });
  });

  it('버전 2 기록은 기본 분류를 만들고 같은 분류를 가리키게 옮긴다', () => {
    const { categoryId: _categoryId, ...base } = ITEM;
    const raw = JSON.stringify({ version: 2, items: [{ ...base, category: 'couple' }] });
    expect(parseStoredData(raw)).toEqual({
      ok: true,
      categories: DEFAULT_CATEGORIES,
      items: [{ ...base, categoryId: 'couple' }],
    });
  });

  it('버전 1 기록은 지우지 않고 개인 분류로 옮긴다', () => {
    const { categoryId: _categoryId, ...v1Item } = ITEM;
    const raw = JSON.stringify({ version: 1, items: [v1Item] });
    expect(parseStoredData(raw)).toEqual({
      ok: true,
      categories: DEFAULT_CATEGORIES,
      items: [{ ...v1Item, categoryId: 'personal' }],
    });
  });
});
