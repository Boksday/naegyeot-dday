import { type Category, type Dday, type DdayData, DEFAULT_CATEGORIES } from '../dday/types';
import { createBackupJson, mergeBackup, parseBackupJson } from './backupFile';

const NOW = new Date('2026-10-03T00:00:00.000Z');

function makeDday(id: string, overrides: Partial<Dday> = {}): Dday {
  return {
    id,
    title: id,
    categoryId: 'personal',
    date: '2026-10-10',
    repeatYearly: false,
    showMilestones: false,
    calendar: 'solar',
    lunar: null,
    order: 0,
    notifyOnDay: true,
    notifyDaysBefore: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

const DATA: DdayData = { categories: [...DEFAULT_CATEGORIES], items: [makeDday('a')] };

describe('백업 파일', () => {
  it('내보낸 파일을 그대로 다시 읽는다', () => {
    expect(parseBackupJson(createBackupJson(DATA, NOW))).toEqual({ ok: true, data: DATA });
  });

  it('이 앱의 백업 파일이 아니면 거부한다', () => {
    expect(parseBackupJson('{"hello":1}')).toEqual({ ok: false, reason: 'not-backup' });
    expect(parseBackupJson('not json')).toEqual({ ok: false, reason: 'invalid-json' });
  });

  it('옛 저장 형식(버전 1)의 데이터도 마이그레이션해서 읽는다', () => {
    const {
      categoryId: _c,
      showMilestones: _s,
      order: _o,
      calendar: _k,
      lunar: _l,
      ...v1
    } = makeDday('old');
    const raw = JSON.stringify({ app: 'naegyeot-dday', data: { version: 1, items: [v1] } });
    const result = parseBackupJson(raw);
    expect(result.ok && result.data.items[0]?.categoryId).toBe('personal');
  });

  it('손상된 데이터는 거부한다', () => {
    const raw = JSON.stringify({ app: 'naegyeot-dday', data: { version: 6, items: 'x' } });
    expect(parseBackupJson(raw)).toEqual({ ok: false, reason: 'invalid-data' });
  });
});

describe('mergeBackup', () => {
  it('없는 디데이만 더하고 기존 기록은 그대로 둔다', () => {
    const incoming: DdayData = {
      categories: [...DEFAULT_CATEGORIES],
      items: [makeDday('a', { title: '바뀐 제목' }), makeDday('b')],
    };
    const { next, added } = mergeBackup(DATA, incoming);
    expect(added).toBe(1);
    expect(next.items.map((item) => [item.id, item.title])).toEqual([
      ['a', 'a'],
      ['b', 'b'],
    ]);
    expect(next.items[1]?.order).toBe(1);
  });

  it('같은 이름의 분류는 기존 분류로 합치고 새 분류는 추가한다', () => {
    const family: Category = { id: 'family', name: '가족', color: 'green', createdAt: '' };
    const myCouple: Category = { id: 'other-couple', name: '연인', color: 'rose', createdAt: '' };
    const incoming: DdayData = {
      categories: [myCouple, family],
      items: [
        makeDday('b', { categoryId: 'other-couple' }),
        makeDday('c', { categoryId: 'family' }),
      ],
    };
    const { next } = mergeBackup(DATA, incoming);
    expect(next.categories.map((category) => category.id)).toEqual([
      'couple',
      'personal',
      'work',
      'family',
    ]);
    expect(next.items.find((item) => item.id === 'b')?.categoryId).toBe('couple');
    expect(next.items.find((item) => item.id === 'c')?.categoryId).toBe('family');
  });
});
