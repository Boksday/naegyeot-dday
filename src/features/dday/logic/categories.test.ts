import { type Dday, type DdayData, DEFAULT_CATEGORIES, MAX_CATEGORIES } from '../types';
import {
  addCategory,
  countItemsInCategory,
  removeCategory,
  validateCategoryName,
} from './categories';

const NOW = '2026-10-02T12:00:00.000Z';

function makeDday(id: string, categoryId: string): Dday {
  return {
    id,
    title: id,
    categoryId,
    date: '2026-10-10',
    repeatYearly: false,
    showMilestones: false,
    calendar: 'solar',
    lunar: null,
    order: 0,
    notifyOnDay: false,
    notifyDaysBefore: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  };
}

const DATA: DdayData = {
  categories: [...DEFAULT_CATEGORIES],
  items: [makeDday('a', 'couple'), makeDday('b', 'work'), makeDday('c', 'couple')],
};

describe('validateCategoryName', () => {
  it('빈 이름, 너무 긴 이름, 겹치는 이름을 막는다', () => {
    expect(validateCategoryName('  ', DATA.categories)).toBe('empty');
    expect(validateCategoryName('가'.repeat(11), DATA.categories)).toBe('too-long');
    expect(validateCategoryName(' 연인 ', DATA.categories)).toBe('duplicate');
    expect(validateCategoryName('가족', DATA.categories)).toBeNull();
  });
});

describe('addCategory', () => {
  it('이름 앞뒤 공백을 지우고 끝에 추가한다', () => {
    const next = addCategory(DATA, { id: 'family', name: ' 가족 ', color: 'green', now: NOW });
    expect(next.categories.at(-1)).toEqual({
      id: 'family',
      name: '가족',
      color: 'green',
      createdAt: NOW,
    });
    expect(next.items).toBe(DATA.items);
  });

  it('최대 개수를 넘으면 실패한다', () => {
    const full: DdayData = {
      categories: Array.from({ length: MAX_CATEGORIES }, (_, index) => ({
        id: `c${index}`,
        name: `분류${index}`,
        color: 'gray',
        createdAt: NOW,
      })),
      items: [],
    };
    expect(() =>
      addCategory(full, { id: 'x', name: '새 분류', color: 'gray', now: NOW }),
    ).toThrow();
  });
});

describe('removeCategory', () => {
  it('분류를 지우고 그 분류의 디데이는 남은 첫 분류로 옮긴다', () => {
    const next = removeCategory(DATA, 'couple', NOW);
    expect(next.categories.map((category) => category.id)).toEqual(['personal', 'work']);
    expect(next.items.map((item) => [item.id, item.categoryId])).toEqual([
      ['a', 'personal'],
      ['b', 'work'],
      ['c', 'personal'],
    ]);
    expect(next.items[0]?.updatedAt).toBe(NOW);
    expect(next.items[1]?.updatedAt).toBe(DATA.items[1]?.updatedAt);
  });

  it('마지막 분류는 지울 수 없다', () => {
    const single: DdayData = { categories: [DEFAULT_CATEGORIES[0]!], items: [] };
    expect(() => removeCategory(single, 'couple', NOW)).toThrow();
  });

  it('없는 분류는 지울 수 없다', () => {
    expect(() => removeCategory(DATA, 'ghost', NOW)).toThrow();
  });
});

describe('countItemsInCategory', () => {
  it('분류에 속한 디데이 수를 센다', () => {
    expect(countItemsInCategory(DATA, 'couple')).toBe(2);
    expect(countItemsInCategory(DATA, 'personal')).toBe(0);
  });
});
